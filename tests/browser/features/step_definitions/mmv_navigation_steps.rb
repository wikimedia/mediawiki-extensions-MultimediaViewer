# encoding: utf-8

When /^I click the next arrow$/ do
  on(E2ETestPage).mmv_next_button_element.when_present.click
end

When /^I click the previous arrow$/ do
  on(E2ETestPage).mmv_previous_button_element.when_present.click
end

When /^I press the browser back button$/ do
  on(E2ETestPage).execute_script("window.history.back();");
end

Then /^the image and metadata of the next image should appear$/ do
  on(E2ETestPage) do |page|
    # MMV was launched, article is not visible yet
    page.image1_in_article_element.should_not be_visible
    check_elements_in_viewer_for_image3 page
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

Then /^I should be navigated back to the original wiki article$/ do
  on(E2ETestPage) do |page|
    page.image1_in_article_element.should be_visible
    page.mmv_wrapper_element.should_not be_visible
  end
end