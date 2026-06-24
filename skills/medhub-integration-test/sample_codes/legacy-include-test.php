<?php

/**
 * Sample: Integration test for a legacy .mh include file.
 *
 * Exercises an include that reads/writes the real DB and emits HTML.
 * Uses #[RunInSeparateProcess] so define() calls and global state are isolated.
 *
 * Copy, rename, and adapt to the specific include you are testing.
 *
 * Run inside mh-php-fpm container:
 *   docker exec mh-php-fpm sh -lc \
 *     'cd /var/www/html && vendor/bin/phpunit -c phpunit.integration.xml \
 *        --coverage-text tests/integration/SampleLegacyIncludeTest.php'
 */

declare(strict_types=1);

use app\core\Request;
use integration\support\IntegrationTestCase;
use integration\support\Seeder;
use PHPUnit\Framework\Attributes\Group;
use PHPUnit\Framework\Attributes\PreserveGlobalState;
use PHPUnit\Framework\Attributes\RunInSeparateProcess;

#[Group('integration')]
class SampleLegacyIncludeTest extends IntegrationTestCase
{
    /** Absolute path to the include file under test. */
    private static string $includeFile;

    public static function setUpBeforeClass(): void
    {
        // Define any constants the include requires before parent bootstraps the DB.
        if (!defined('INCLUDES')) {
            define('INCLUDES', dirname(__DIR__, 2) . '/app/includes');
        }

        self::$includeFile = dirname(__DIR__, 2) . '/app/includes/path/to/include.mh';

        parent::setUpBeforeClass();
    }

    /**
     * @given a seeded resident with program and a valid request with step=1
     * @when  the legacy include is executed in a separate process
     * @then  the expected DB row is written and the output contains the success message
     */
    #[RunInSeparateProcess]
    #[PreserveGlobalState(false)]
    public function testIncludeHappyPath(): void
    {
        [$iID, $programID, $residentID] = Seeder::residentWithProgram(self::$db);

        $output = $this->runInclude($residentID, $iID, $programID, [
            'step'  => '1',
            'param' => 'value',
        ]);

        // Assert DB side-effects against the seeded ID.
        $row = self::$db->query_fetch_row(
            'SELECT col FROM some_table WHERE userID = ' . $residentID,
            'w'
        );
        $this->assertIsArray($row, 'Expected a row in some_table for the seeded user');
        $this->assertEquals('expected_value', $row['col']);

        // Assert HTML output.
        $this->assertStringContainsString('success message', $output);
    }

    /**
     * @given a seeded resident with program and a trigger that forces the INSERT to fail
     * @when  the legacy include is executed in a separate process
     * @then  no row is written to the DB and the output contains the error message
     */
    #[RunInSeparateProcess]
    #[PreserveGlobalState(false)]
    public function testIncludeRollsBackOnError(): void
    {
        [$iID, $programID, $residentID] = Seeder::residentWithProgram(self::$db);

        // Force a DB error by installing a trigger.
        self::$db->query('DROP TRIGGER IF EXISTS trg_sample_force_fail', 'w');
        self::$db->query(
            "CREATE TRIGGER trg_sample_force_fail BEFORE INSERT ON some_table "
            . "FOR EACH ROW SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'forced failure'",
            'w'
        );

        $output = $this->runInclude($residentID, $iID, $programID, ['step' => '1']);

        // Nothing should have been written.
        $row = self::$db->query_fetch_row(
            'SELECT col FROM some_table WHERE userID = ' . $residentID,
            'w'
        );
        $this->assertFalse(
            is_array($row) && count($row) > 0,
            'No row should exist after a rolled-back operation'
        );

        $this->assertStringContainsString('error message', $output);
    }

    protected function tearDown(): void
    {
        if (self::$available && self::$db !== null) {
            self::$db->query('DROP TRIGGER IF EXISTS trg_sample_force_fail', 'w');
        }
    }

    /**
     * Execute the legacy include, capturing all output.
     *
     * Variables bound here are visible to the include (same PHP scope).
     *
     * @param array<string,string> $params Request parameters the include reads.
     */
    private function runInclude(int $residentID, int $iID, int $programID, array $params): string
    {
        // Bind variables the include expects.
        $request  = new Request($params);
        $db       = self::$db;
        $settings = new stdClass();
        $settings->iID = $iID;

        $_SESSION['programID'] = $programID;
        $_SESSION['userID']    = $residentID;

        ob_start();
        try {
            include self::$includeFile;
        } finally {
            $output = ob_get_clean();
        }

        return (string) $output;
    }
}
