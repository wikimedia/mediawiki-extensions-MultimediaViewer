@en.wikipedia.beta.wmflabs.org @firefox @chrome @internet_explorer_9 @internet_explorer_10 @internet_explorer_11 @safari @test2.wikipedia.org
Feature: Download menu

  Background:
    Given I am viewing an image using MMV

  Scenario: Download menu can be opened
    When I click the download icon
    Then the download menu should appear

  Scenario: Clicking the image closes the download menu
    Given I open the download menu
    When I click the image
    Then the download menu should disappear

  Scenario: Image size defaults to original
    When I open the download menu
    Then the download image size label should match the original
      And the download links should be the original image

  Scenario: Attribution area is collapsed by default
    When I open the download menu
    Then the attribution area should be collapsed

  Scenario: Attribution area can be opened
    Given I open the download menu
    When I click on the attribution area
    Then the attribution area should be open

  Scenario: Attribution area can be closed
    Given I open the download menu
      And the attribution area is open
    When I click on the attribution area close icon
    Then the attribution area should be collapsed

  Scenario: The small download option has the correct information
    Given I open the download dropdown
    When I click the small download size
    Then the download size options should disappear
      And the download image size label should match the small size
      And the download links should be the small thumbnail

  Scenario: The medium download option has the correct information
    Given I open the download dropdown
    When I click the medium download size
    Then the download size options should disappear
      And the download image size label should match the medium size
      And the download links should be the medium thumbnail

  Scenario: The large download option has the correct information
    Given I open the download dropdown
    When I click the large download size
    Then the download size options should disappear
      And the download image size label should match the large size
      And the download links should be the large thumbnail