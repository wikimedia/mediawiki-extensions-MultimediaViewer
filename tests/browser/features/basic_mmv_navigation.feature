@en.wikipedia.beta.wmflabs.org @firefox @chrome @internet_explorer_8 @internet_explorer_9 @internet_explorer_10 @internet_explorer_11 @safari @test2.wikipedia.org
Feature: Basic Multimedia Viewer navigation

  Scenario: Multimedia Viewer (MMV)
    Given I am at a wiki article with at least two embedded pictures
    When I click on the first image in the article
    Then the image metadata and the image itself should be there
    When I click the next arrow
    Then the image and metadata of the next image should appear
    When I click the previous arrow
    Then the image and metadata of the previous image should appear
    When I close MMV
    Then I should be navigated back to the original wiki article
    Then the wiki article should be scrolled to the same position as before opening MMV
    When I click on the first image in the article
    And I press the browser back button
    Then I should be navigated back to the original wiki article
    Then the wiki article should be scrolled to the same position as before opening MMV