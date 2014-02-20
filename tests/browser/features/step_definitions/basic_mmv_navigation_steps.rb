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

    check_elements_in_viewer_for_image2(page)
  end
end

Then(/^the image metadata and the image itself should be there$/) do
  on(LightboxDemoPage) do |page|
    # MMV was launched, article is not visible now
    page.image1_in_article_element.should_not be_visible

    check_elements_in_viewer_for_image1(page)
  end
end

Then(/^the image and metadata of the previous image should appear$/) do
  on(LightboxDemoPage) do |page|
    # MMV was launched, article is not visible yet
    page.image1_in_article_element.should_not be_visible

    check_elements_in_viewer_for_image1(page)
  end
end

# Helper function that verifies the presence of various elements in viewer
# while looking at image1 (Kerala)
def check_elements_in_viewer_for_image1(page)
    # Check basic MMV elements are present
    page.mmv_wrapper_element.should be_visible
    page.mmv_image_div_element.should be_visible

    # Check image content
    page.mmv_image_div_element.image_element.attribute('src').should match /Kerala|^data:image;base64,.+gBeRmlsZSB/

    # Check basic metadata is present

    # Title
    page.mmv_metadata_title_element.when_present.text.should match /Sunrise over fishing boats in Kerala/
    # License
    page.mmv_metadata_license_element.when_present.attribute('href').should match /boats_in_Kerala.jpg$/
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
    # Repo link
    page.mmv_image_metadata_repo_link_element.when_present.text.should match /Learn more on Wikimedia Commons/
    page.mmv_image_metadata_repo_link_element.when_present.attribute('href').should match /boats_in_Kerala.jpg$/
    # Category links
    page.mmv_image_metadata_category_links_wrapper_element.when_present.should be_visible
    # File usage
    page.mmv_image_metadata_fileusage_wrapper_element.when_present.should be_visible
    page.mmv_image_metadata_fileusage_wrapper_element.when_present.h3_element.text.should match /Used in [0-9] page/
    page.mmv_image_metadata_fileusage_local_section_title_element.when_present.text.should match /On this site/
end

# Helper function that verifies the presence of various elements in viewer
# while looking at image2 (Aquarium)
def check_elements_in_viewer_for_image2(page)
    # MMV was launched, article is not visible
    page.image1_in_article_element.should_not be_visible

    # Check basic MMV elements are present
    page.mmv_wrapper_element.should be_visible
    page.mmv_image_div_element.should be_visible

    # Check image content
    page.mmv_image_div_element.image_element.attribute('src').should match /Offsite|^data:image;base64,.+gB4Rmls/

    # Check basic metadata is present

    # Title
    page.mmv_metadata_title_element.when_present.text.should match /All Hands Offsite/
    # License
    page.mmv_metadata_license_element.when_present.attribute('href').should match /All_Hands_Offsite.*\.jpg$/
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
    # Repo link
    page.mmv_image_metadata_repo_link_element.when_present.text.should match /Learn more on Wikimedia Commons/
    page.mmv_image_metadata_repo_link_element.when_present.attribute('href').should match /All_Hands_Offsite.*\.jpg$/
    # Category links
    page.mmv_image_metadata_category_links_wrapper_element.when_present.should be_visible
    # File usage
    page.mmv_image_metadata_fileusage_wrapper_element.when_present.should be_visible
    page.mmv_image_metadata_fileusage_wrapper_element.when_present.h3_element.text.should match /Used in [0-9] page/
    page.mmv_image_metadata_fileusage_local_section_title_element.when_present.text.should match /On this site/
end
