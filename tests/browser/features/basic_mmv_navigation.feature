@en.wikipedia.beta.wmflabs.org @login
Feature: Basic Multimedia Viewer navigation

  NOTE: This test should be run against '/Lightbox_demo' to work correctly

  Original acceptance criteria:
  1) Open MMV
  2) Check metadata and picture are there
  3) Move to next image
  4) Check corresponding metadata and picture are there
  5) Move to the previous image
  6) Check corresponding metadata and picture are there
  7) Close MV and make sure we go back to article.

  Scenario: Multimedia Viewer (MMV)
    Given I am logged in
    And I am at a wiki article with at least two embedded pictures
    When I click on the first image in the article
    Then the image metadata and the image itself should be there
    When I click the next arrow
    Then the image and metadata of the next image should appear
    When I click the previous arrow
    Then the image and metadata of the previous image should appear
    When I close MMV
    Then I should be navigated back to the original wiki article
