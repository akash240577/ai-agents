<?php

/**
 * Sample: Integration test for a domain model.
 *
 * Tests that a domain model correctly loads from a real MariaDB row seeded by Seeder.
 * Copy, rename, and adapt to the specific domain model you are testing.
 *
 * Run inside mh-php-fpm container:
 *   docker exec mh-php-fpm sh -lc \
 *     'cd /var/www/html && vendor/bin/phpunit -c phpunit.integration.xml \
 *        --coverage-text tests/integration/SampleDomainModelTest.php'
 */

declare(strict_types=1);

use app\domainModels\Evaluation\Response;
use integration\support\IntegrationTestCase;
use integration\support\Seeder;
use PHPUnit\Framework\Attributes\Group;

#[Group('integration')]
class SampleDomainModelTest extends IntegrationTestCase
{
    /**
     * @given an evaluation response row exists in the database with status 3
     * @when  the domain model is loaded via Response::get() with the seeded ID
     * @then  a non-null model is returned and its ID and status match the seeded values
     */
    public function testModelLoadsFromSeededRow(): void
    {
        // Seed a fresh evaluation response and capture its ID.
        $responseID = Seeder::evaluationResponse(self::$db, [
            'response_status' => 3,
            'eval_type'       => 1,
        ]);

        $this->assertGreaterThan(0, $responseID, 'Seeder should return a positive responseID');

        // Minimal session the model's lazy loaders may need.
        $_SESSION['programID'] = 1;
        $_SESSION['userID']    = 100;
        $_SESSION['usertype']  = 2;

        // Act: load the domain model from the real DB.
        $response = Response::get($responseID);

        // Assert: model loads and reflects the seeded values.
        $this->assertNotNull($response, 'Domain model should load for the seeded ID');
        $this->assertEquals($responseID, $response->getId());
        $this->assertEquals(3, $response->getStatus());
    }

    /**
     * @given no evaluation response exists for the given ID
     * @when  the domain model is loaded via Response::get() with PHP_INT_MAX as the ID
     * @then  null is returned
     */
    public function testModelReturnsNullForUnknownId(): void
    {
        $result = Response::get(PHP_INT_MAX);

        $this->assertNull($result, 'Model::get() should return null for an unknown ID');
    }
}
