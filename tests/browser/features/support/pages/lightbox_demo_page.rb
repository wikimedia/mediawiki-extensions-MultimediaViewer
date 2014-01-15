class LightboxDemoPage
  include PageObject

  include URL
  page_url URL.url("Lightbox_demo")

  # Tag page elements that we will need.
  a(:login, text: "Log in")
  a(:image1_in_article, href: /\.jpg$/)
  div(:mmv_wrapper, class: "mlb-wrapper")
  div(:mmv_image_div, class: "mlb-image")
  span(:mmv_metadata_title, class: "mw-mlb-title")
  p(:mmv_metadata_desc, class: "mw-mlb-image-desc")
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
