# encoding: utf-8

Given /^I am at a wiki article with at least two embedded pictures$/ do
  visit(E2ETestPage)
  on(E2ETestPage).image1_in_article_element.should be_visible
end

Given /^I open the download menu$/ do
  step "I click the download icon"
  step "the download menu should appear"
end

Given /^I am viewing an image using MMV$/ do
  step "I am at a wiki article with at least two embedded pictures"
  step "I click on the second image in the article"
  step "the image metadata and the image itself should be there"
end

Given /^the attribution area is open$/ do
  step "I click on the attribution area"
end

Given /^I open the download dropdown$/ do
  step "I open the download menu"
  step "the download image size label should match the original"
  step "the download links should be the original image"
  step "I click the download down arrow icon"
  step "the download size options should appear"
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

When /^I click on an unrelated image in the article to warm up the browser cache$/ do
  on(E2ETestPage).other_image_in_article
end

When /^I click the next arrow$/ do
  on(E2ETestPage).mmv_next_button_element.when_present.click
end

When /^I click the previous arrow$/ do
  on(E2ETestPage).mmv_previous_button_element.when_present.click
end

When /^I close MMV$/ do
  on(E2ETestPage).mmv_close_button_element.when_present(30).click
end

When /^I press the browser back button$/ do
  on(E2ETestPage).execute_script("window.history.back();");
end

When /^I click the download icon$/ do
  on(E2ETestPage).mmv_download_icon_element.click
end

When /^I click the image$/  do
  on(E2ETestPage).mmv_image_div_element.click
end

When /^I click the download down arrow icon$/  do
  on(E2ETestPage).mmv_download_down_arrow_icon_element.click
end

When /^I click on the attribution area$/ do
  on(E2ETestPage).mmv_download_attribution_area_element.click
end

When /^I click on the attribution area close icon$/ do
  on(E2ETestPage).mmv_download_attribution_area_close_icon_element.click
end

When /^I click the (.*) download size$/ do |size_option|
  on(E2ETestPage) do |page|
    case size_option
    when "small"
      @index = 1
    when "medium"
      @index = 2
    when "large"
      @index = 3
    else
      @index = 0
    end

    page.mmv_download_size_options_elements[@index].click
  end
end

Then /^I should be navigated back to the original wiki article$/ do
  on(E2ETestPage) do |page|
    page.image1_in_article_element.should be_visible
    page.mmv_wrapper_element.should_not be_visible
  end
end

Then /^the image and metadata of the next image should appear$/ do
  on(E2ETestPage) do |page|
    # MMV was launched, article is not visible yet
    page.image1_in_article_element.should_not be_visible
    check_elements_in_viewer_for_image3 page
  end
end

Then /^the image metadata and the image itself should be there$/ do
  on(E2ETestPage) do |page|
    # MMV was launched, article is not visible now
    page.image1_in_article_element.should_not be_visible
    check_elements_in_viewer_for_image2 page
  end
end

Then /^the image and metadata of the previous image should appear$/ do
  on(E2ETestPage) do |page|
    # MMV was launched, article is not visible yet
    page.image1_in_article_element.should_not be_visible
    check_elements_in_viewer_for_image1 page
  end
end

Then /^the wiki article should be scrolled to the same position as before opening MMV$/ do
  on(E2ETestPage) do |page|
    @scrollDifference = page.execute_script("return $(window).scrollTop();") - @articleScrollTop
    @scrollDifference.abs.should be < 2
  end
end

Then /^the download menu should appear$/ do
  on(E2ETestPage).mmv_download_menu_element.when_present.should be_visible
end

Then /^the download menu should disappear$/ do
  on(E2ETestPage).mmv_download_menu_element.should_not be_visible
end

Then /^the download image size label should match the original$/ do
  on(E2ETestPage).mmv_download_size_label_element.when_present.text.should eq "4000 × 3000 px jpg"
end

Then /^the download image size label should match the small size$/ do
  on(E2ETestPage).mmv_download_size_label_element.when_present.text.should eq "193 × 145 px jpg"
end

Then /^the download image size label should match the medium size$/ do
  on(E2ETestPage).mmv_download_size_label_element.when_present.text.should eq "640 × 480 px jpg"
end

Then /^the download image size label should match the large size$/ do
  on(E2ETestPage).mmv_download_size_label_element.when_present.text.should eq "1200 × 900 px jpg"
end

Then /^the download size options should appear$/ do
  on(E2ETestPage).mmv_download_size_menu_element.when_present.should be_visible
end

Then /^the download size options should disappear$/ do
  on(E2ETestPage).mmv_download_size_menu_element.when_not_present
end

Then /^the download links should be the original image$/ do
  on(E2ETestPage) do |page|
    page.mmv_download_link_element.attribute('href').should match /^?download$/
    page.mmv_download_preview_link_element.attribute('href').should_not match /^?download$/
    page.mmv_download_link_element.attribute('href').should_not match /\/thumb\//
    page.mmv_download_preview_link_element.attribute('href').should_not match /\/thumb\//
  end
end

Then /^the download links should be the (\d+) thumbnail$/ do |thumb_size|
  on(E2ETestPage) do |page|
    Watir::Wait.until { page.mmv_download_link_element.attribute('href').match thumb_size }
    page.mmv_download_link_element.attribute('href').should match /^?download$/
    page.mmv_download_preview_link_element.attribute('href').should_not match /^?download$/
    page.mmv_download_preview_link_element.attribute('href').should match thumb_size
  end
end

Then /^the download links should be the small thumbnail$/ do
  step "the download links should be the 193 thumbnail"
end

Then /^the download links should be the medium thumbnail$/ do
  step "the download links should be the 640 thumbnail"
end

Then /^the download links should be the large thumbnail$/ do
  step "the download links should be the 1200 thumbnail"
end

Then /^the attribution area should be collapsed$/ do
  on(E2ETestPage).mmv_download_attribution_area_element.attribute('class').should match /mw-mmv-download-attribution-collapsed/
end

Then /^the attribution area should be open$/ do
  on(E2ETestPage).mmv_download_attribution_area_element.attribute('class').should_not match /mw-mmv-download-attribution-collapsed/
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
  page.mmv_metadata_title_element.when_present.text.should match /Sunrise over fishing boats in Kerala/
  # License
  page.mmv_metadata_license_element.when_present.attribute('href').should match /^http:\/\/creativecommons\.org\/licenses\/by-sa\/3\.0$/
  page.mmv_metadata_license_element.when_present.text.should match /CC BY-SA 3.0/
  # Credit
  page.mmv_metadata_credit_element.when_present.should be_visible
  page.mmv_metadata_source_element.when_present.text.should match /Own work/

  # Image metadata
  page.mmv_image_metadata_wrapper_element.when_present.should be_visible
  # Caption
  page.mmv_image_metadata_caption_element.when_present.text.should match /Sunrise over fishing boats/
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
  page.mmv_metadata_title_element.when_present.text.should match /All Hands Offsite/
  # License
  page.mmv_metadata_license_element.when_present.attribute('href').should match /^http:\/\/creativecommons\.org\/licenses\/by-sa\/3\.0$/
  page.mmv_metadata_license_element.when_present.text.should match /CC BY-SA 3.0/
  # Credit
  page.mmv_metadata_credit_element.when_present.should be_visible
  page.mmv_metadata_source_element.when_present.text.should match /Wikimedia Foundation/

  # Image metadata
  page.mmv_image_metadata_wrapper_element.when_present.should be_visible
  # Caption
  page.mmv_image_metadata_caption_element.when_present.text.should match /Tropical Fish Aquarium/
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
  page.mmv_metadata_title_element.when_present.text.should match /Wikimania 2013 - Hong Kong - Photo 090/
  # License
  page.mmv_metadata_license_element.when_present.attribute('href').should match /^http:\/\/creativecommons\.org\/licenses\/by-sa\/3\.0$/
  page.mmv_metadata_license_element.when_present.text.should match /CC BY-SA 3.0/
  # Credit
  page.mmv_metadata_credit_element.when_present.should be_visible
  page.mmv_metadata_source_element.when_present.text.should match /Wikimedia Foundation/

  # Image metadata
  page.mmv_image_metadata_wrapper_element.when_present.should be_visible
  # Caption
  page.mmv_image_metadata_caption_element.when_present.text.should match /Hong Kong Harbor at night/
  # Description
  page.mmv_image_metadata_desc_element.when_present.text.should match /Photos from our product team's talks at Wikimania 2013 in Hong Kong./
  # Image metadata links
  page.mmv_image_metadata_links_wrapper_element.when_present.should be_visible
  # Details link
  page.mmv_details_page_link_element.when_present.text.should match /More details/
  page.mmv_details_page_link_element.when_present.attribute('href').should match /Wikimania_2013_-_Hong_Kong_-_Photo_090\.jpg$/
end
