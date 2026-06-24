<?php

// Sample MedHub unit test demonstrating:
//   - placement/namespace mirroring app/ under tests/unit/ with a `unit\` prefix
//   - mocking the Database wrapper (query_fetch_row + consecutive query_fetch_value)
//   - mocking a collaborator that would otherwise hit Database::getInstance()
//   - reading protected result state (_elements / _pairs) via Reflection
//   - covering an edge case (zero/negative range) plus a regression case
//
// Based on tests/unit/app/models/PortfolioDashboard/Channel/PDCLoginStatisticsTest.php

namespace unit\app\models\PortfolioDashboard\Channel;

use app\models\PortfolioDashboard\Channel\PDCLoginStatistics;
use app\models\PortfolioDashboard\ChannelElements\PDCElementKeyValueSet;
use app\models\PortfolioDashboard\PortfolioDashboardTrainingHistory;
use app\services\core\Database;
use PHPUnit\Framework\TestCase;
use ReflectionClass;

class ChannelCalculateTest extends TestCase
{
	public function testCalculateWithZeroLengthRangeDoesNotDivideByZero(): void
	{
		$effDate = '2026-06-23';
		$channel = $this->buildChannel($effDate, $totalLogins = 5);

		$channel->calculate($this->buildDatabaseMock($totalLogins), $effDate);

		$this->assertSame('5.0', $this->getLoginsPerWeek($channel));
	}

	public function testCalculateWithMultiWeekRangeIsUnchanged(): void
	{
		$effDate = '2026-06-23';
		// 2026-01-01 -> 2026-06-23 is ~25 weeks; 50 logins / 25 weeks = 2.0
		$channel = $this->buildChannel('2026-01-01', $totalLogins = 50);

		$channel->calculate($this->buildDatabaseMock($totalLogins), $effDate);

		$this->assertSame('2.0', $this->getLoginsPerWeek($channel));
	}

	private function buildChannel(string $programStart, int $totalLogins): PDCLoginStatistics
	{
		$trainingHistory = $this
			->getMockBuilder(PortfolioDashboardTrainingHistory::class)
			->disableOriginalConstructor()
			->getMock();
		$trainingHistory->method('getProgramStart')->willReturn($programStart);

		$channel = new PDCLoginStatistics();
		$channel->setTarget(101, 202, $trainingHistory);

		return $channel;
	}

	private function buildDatabaseMock(int $totalLogins): Database
	{
		$databaseMock = $this
			->getMockBuilder(Database::class)
			->disableOriginalConstructor()
			->getMock();

		// Wide PG window so the range is NOT clamped.
		$databaseMock
			->method('query_fetch_row')
			->willReturn(['pg_start_date' => '2000-01-01', 'pg_end_date' => '2099-12-31']);

		// 1st value() = total logins, 2nd = last-login date_time.
		$databaseMock
			->method('query_fetch_value')
			->willReturnOnConsecutiveCalls($totalLogins, '2026-06-22 09:00:00');

		return $databaseMock;
	}

	private function getLoginsPerWeek(PDCLoginStatistics $channel): string
	{
		$elementsProperty = (new ReflectionClass($channel))->getProperty('_elements');
		$elementsProperty->setAccessible(true);
		$set = $elementsProperty->getValue($channel)[0];
		$this->assertInstanceOf(PDCElementKeyValueSet::class, $set);

		$pairsProperty = (new ReflectionClass($set))->getProperty('_pairs');
		$pairsProperty->setAccessible(true);

		foreach ($pairsProperty->getValue($set) as $pair) {
			if ($pair->getKey() === 'Logins per Week') {
				return $pair->getValue();
			}
		}

		$this->fail('No "Logins per Week" pair was appended to the channel.');
	}
}
