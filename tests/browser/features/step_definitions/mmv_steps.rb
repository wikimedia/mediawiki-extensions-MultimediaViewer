# encoding: utf-8

Given /^I am at a wiki article with at least two embedded pictures$/ do
  visit(E2ETestPage)
  on(E2ETestPage).image1_in_article_element.should be_visible
end

Given /^I am viewing an image using MMV$/ do
  step "I am at a wiki article with at least two embedded pictures"
  step "I click on the second image in the article"
  step "the image metadata and the image itself should be there"
end

When /^I click on the first image in the article$/ do
  on(E2ETestPage) do |page|
    # We store the offset of the image as the scroll position and scroll to it, because cucumber/selenium
    # sometimes automatically scrolls to it when we ask it to click on it (seems to depend on timing)
    @articleScrollTop = page.execute_script("var scrollTop = Math.round($('a[href=\"/wiki/File:Sunrise_over_fishing_boats_in_Kerala.jpg\"]').first().find('img').offset().top); window.scrollTo(0, scrollTop); return scrollTop;")
    # Scrolls to the image and clicks on it
    page.image1_in_article
    # This is a global variable that can be used to measure performance
    @image_click_time = Time.now.getutc
  end
end

When /^I click on the second image in the article$/ do
  on(E2ETestPage) do |page|
    # We store the offset of the image as the scroll position and scroll to it, because cucumber/selenium
    # sometimes automatically scrolls to it when we ask it to click on it (seems to depend on timing)
    @articleScrollTop = page.execute_script("var scrollTop = Math.round($('a[href=\"/wiki/File:Wikimedia_Foundation_2013_All_Hands_Offsite_-_Day_2_-_Photo_24.jpg\"]').first().find('img').offset().top); window.scrollTo(0, scrollTop); return scrollTop;")
    # Scrolls to the image and clicks on it
    page.image2_in_article
    # This is a global variable that can be used to measure performance
    @image_click_time = Time.now.getutc
  end
end

When /^I close MMV$/ do
  on(E2ETestPage).mmv_close_button_element.when_present(30).click
end

When /^I click the image$/  do
  on(E2ETestPage).mmv_image_div_element.click
end

Then /^the image metadata and the image itself should be there$/ do
  on(E2ETestPage) do |page|
    # MMV was launched, article is not visible now
    page.image1_in_article_element.should_not be_visible
    check_elements_in_viewer_for_image2 page
  end
end

# Helper function that verifies the presence of various elements in viewer
# while looking at image1 (Kerala)
def check_elements_in_viewer_for_image1(page)
  # Check basic MMV elements are present
  page.mmv_overlay_element.when_present.should be_visible
  page.mmv_wrapper_element.when_present.should be_visible
  page.mmv_image_div_element.should be_visible

  # Check image content
  page.mmv_image_div_element.image_element.attribute('src').should match /Kerala/

  # Check basic metadata is present

  # Title
  page.mmv_metadata_title_element.when_present.text.should match /^Sunrise over fishing boats$/
  # License
  page.mmv_metadata_license_element.when_present.attribute('href').should match /^http:\/\/creativecommons\.org\/licenses\/by-sa\/3\.0$/
  page.mmv_metadata_license_element.when_present.text.should match /CC BY-SA 3.0/
  # Credit
  page.mmv_metadata_credit_element.when_present.should be_visible
  page.mmv_metadata_source_element.when_present.text.should match /Own work/

  # Image metadata
  page.mmv_image_metadata_wrapper_element.when_present.should be_visible
  # Description
  page.mmv_image_metadata_desc_element.when_present.text.should match /Sunrise over fishing boats on the beach south of Kovalam/
  # Image metadata links
  page.mmv_image_metadata_links_wrapper_element.when_present.should be_visible
  # Details link
  page.mmv_details_page_link_element.when_present.text.should match /More details/
  page.mmv_details_page_link_element.when_present.attribute('href').should match /boats_in_Kerala.jpg$/
end

# Helper function that verifies the presence of various elements in viewer
# while looking at image2 (Aquarium)
def check_elements_in_viewer_for_image2(page)
  # Check basic MMV elements are present
  page.mmv_overlay_element.when_present.should be_visible
  page.mmv_wrapper_element.when_present.should be_visible
  page.mmv_image_div_element.should be_visible

  # Check image content
  page.mmv_image_div_element.image_element.attribute('src').should match /Offsite/

  # Check basic metadata is present

  # Title
  page.mmv_metadata_title_element.when_present.text.should match /^Tropical Fish Aquarium$/
  # License
  page.mmv_metadata_license_element.when_present.attribute('href').should match /^http:\/\/creativecommons\.org\/licenses\/by-sa\/3\.0$/
  page.mmv_metadata_license_element.when_present.text.should match /CC BY-SA 3.0/
  # Credit
  page.mmv_metadata_credit_element.when_present.should be_visible
  page.mmv_metadata_source_element.when_present.text.should match /Wikimedia Foundation/

  # Image metadata
  page.mmv_image_metadata_wrapper_element.when_present.should be_visible
  # Description
  page.mmv_image_metadata_desc_element.when_present.text.should match /Photo from Wikimedia Foundation/
  # Image metadata links
  page.mmv_image_metadata_links_wrapper_element.when_present.should be_visible
  # Details link
  page.mmv_details_page_link_element.when_present.text.should match /More details/
  page.mmv_details_page_link_element.when_present.attribute('href').should match /All_Hands_Offsite.*\.jpg$/
end

# Helper function that verifies the presence of various elements in viewer
# while looking at image3 (Hong Kong)
def check_elements_in_viewer_for_image3(page)
  # Check basic MMV elements are present
  page.mmv_overlay_element.when_present.should be_visible
  page.mmv_wrapper_element.when_present.should be_visible
  page.mmv_image_div_element.should be_visible

  # Check image content
  page.mmv_image_div_element.image_element.attribute('src').should match /Hong_Kong/

  # Check basic metadata is present

  # Title
  page.mmv_metadata_title_element.when_present.text.should match /^Hong Kong Harbor at night$/
  # License
  page.mmv_metadata_license_element.when_present.attribute('href').should match /^http:\/\/creativecommons\.org\/licenses\/by-sa\/3\.0$/
  page.mmv_metadata_license_element.when_present.text.should match /CC BY-SA 3.0/
  # Credit
  page.mmv_metadata_credit_element.when_present.should be_visible
  page.mmv_metadata_source_element.when_present.text.should match /Wikimedia Foundation/

  # Image metadata
  page.mmv_image_metadata_wrapper_element.when_present.should be_visible
  # Description
  page.mmv_image_metadata_desc_element.when_present.text.should match /Photos from our product team's talks at Wikimania 2013 in Hong Kong./
  # Image metadata links
  page.mmv_image_metadata_links_wrapper_element.when_present.should be_visible
  # Details link
  page.mmv_details_page_link_element.when_present.text.should match /More details/
  page.mmv_details_page_link_element.when_present.attribute('href').should match /Wikimania_2013_-_Hong_Kong_-_Photo_090\.jpg$/
end
