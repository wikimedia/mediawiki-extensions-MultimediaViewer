class CommonsPage
  include PageObject

  include URL
  page_url URL.url("File:Sunrise_over_fishing_boats_in_Kerala.jpg")

  img(:commons_image, src: /Kerala\.jpg$/)

  div(:mmv_image_loaded_cucumber, class: "mw-mmv-image-loaded-cucumber")
end