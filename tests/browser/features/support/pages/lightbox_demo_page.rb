class LightboxDemoPage
  include PageObject

  include URL
  page_url URL.url("Lightbox_demo")

  # Tag page elements that we will need.

  # First image in lightbox demo page
  a(:image1_in_article, href: /\.jpg$/)

  # Wrapper div for all mmv elements
  div(:mmv_wrapper, class: "mlb-wrapper")

  # Wrapper div for image
  div(:mmv_image_div, class: "mlb-image")

  # Metadata elements
  span(:mmv_metadata_title, class: "mw-mlb-title")
  a(:mmv_metadata_license, class: "mw-mlb-license cc-license")
  p(:mmv_metadata_credit, class: "mw-mlb-credit")
  span(:mmv_metadata_source, class: "mw-mlb-source")

  div(:mmv_image_metadata_wrapper, class: "mw-mlb-image-metadata")
  p(:mmv_image_metadata_caption, class: "mw-mlb-caption")
  p(:mmv_image_metadata_desc, class: "mw-mlb-image-desc")

  ul(:mmv_image_metadata_links_wrapper, class: "mw-mlb-image-links")
  a(:mmv_image_metadata_repo_link, class: "mw-mlb-repo")
  li(:mmv_image_metadata_category_links_wrapper, class: "mw-mlb-image-category")

  # File usage
  div(:mmv_image_metadata_fileusage_wrapper, class: "mw-mlb-fileusage-container")
  li(:mmv_image_metadata_fileusage_local_section_title, class: "mw-mlb-fileusage-local-section")

  # Controls
  div(:mmv_next_button, class: "mw-mlb-next-image")
  div(:mmv_previous_button, class: "mw-mlb-prev-image")
  div(:mmv_close_button, class: "mlb-close")

  # Convenient functions on some of these elements
  def next_image()
    mmv_next_button_element.fire_event("onfocus")
    mmv_next_button_element.when_present.click
  end

  def previous_image()
    mmv_previous_button_element.fire_event("onfocus")
    mmv_previous_button_element.when_present.click
  end

  def exit_mmv()
    mmv_close_button_element.fire_event("onfocus")
    mmv_close_button_element.when_present.click
  end

end
