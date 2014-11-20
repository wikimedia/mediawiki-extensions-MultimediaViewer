# encoding: utf-8

Given /^I open the download menu$/ do
  step "I click the download icon"
  step "the download menu should appear"
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

When /^I click the download icon$/ do
  on(E2ETestPage).mmv_download_icon_element.click
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

    page.mmv_download_size_options_elements[@index].when_present.click
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