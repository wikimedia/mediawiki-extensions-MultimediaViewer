Given(/^I am at a wiki article with at least two embedded pictures$/) do
  visit(LightboxDemoPage)
  on(LightboxDemoPage).image1_in_article_element.should be_visible
end

When(/^I click on the first image in the article$/) do
  on(LightboxDemoPage) do |page|
    page.image1_in_article
  end
end

When(/^I click the next arrow$/) do
  on(LightboxDemoPage) do |page|
    page.next_image()
  end
end

When(/^I click the previous arrow$/) do
  on(LightboxDemoPage) do |page|
    page.previous_image()
  end
end

When(/^I close MMV$/) do
  on(LightboxDemoPage) do |page|
    page.exit_mmv()
  end
end

Then(/^I should be navigated back to the original wiki article$/) do
  on(LightboxDemoPage) do |page|
    page.image1_in_article_element.should be_visible
    page.mmv_wrapper_element.should_not be_visible
  end
end

Then(/^the image and metadata of the next image should appear$/) do
  on(LightboxDemoPage) do |page|
    # MMV was launched, article is not visible yet
    page.image1_in_article_element.should_not be_visible

    # Check basic MMV elements are present
    page.mmv_wrapper_element.should be_visible
    page.mmv_image_div_element.should be_visible

    # Check image content
    page.mmv_image_div_element.image_element.attribute('src').should match /Offsite/

    # Check metadata is present
    page.mmv_metadata_title_element.should exist
    page.mmv_metadata_title_element.should exist
    page.mmv_metadata_desc_element.should exist
  end
end

Then(/^the image metadata and the image itself should be there$/) do
  on(LightboxDemoPage) do |page|
    # MMV was launched, article is not visible now
    page.image1_in_article_element.should_not be_visible

    # Check basic MMV elements are present
    page.mmv_wrapper_element.should be_visible
    page.mmv_image_div_element.should be_visible

    # Check image content
    page.mmv_image_div_element.image_element.attribute('src').should match /Kerala/

    # Check metadata is present
    page.mmv_metadata_title_element.should exist
    page.mmv_metadata_title_element.should exist
    page.mmv_metadata_desc_element.should exist
  end
end

Then(/^the image and metadata of the previous image should appear$/) do
  on(LightboxDemoPage) do |page|
    # MMV was launched, article is not visible yet
    on(LightboxDemoPage).image1_in_article_element.should_not be_visible

    # Check basic MMV elements are present
    page.mmv_wrapper_element.should be_visible
    page.mmv_image_div_element.should be_visible

    # Check image content
    page.mmv_image_div_element.image_element.attribute('src').should match /Kerala/

    # Check metadata is present
    page.mmv_metadata_title_element.should exist
    page.mmv_metadata_title_element.should exist
    page.mmv_metadata_desc_element.should exist
  end
end
