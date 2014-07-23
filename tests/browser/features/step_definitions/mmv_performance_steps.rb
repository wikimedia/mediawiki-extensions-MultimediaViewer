Given /^I visit the Commons page$/ do
  @commons_open_time = Time.now.getutc
  @browser.goto "https://commons.wikimedia.org/wiki/File:Sunrise_over_fishing_boats_in_Kerala.jpg"
end

Given /^I visit an unrelated Commons page to warm up the browser cache$/ do
  @browser.goto "https://commons.wikimedia.org/wiki/File:Wikimedia_Foundation_2013_All_Hands_Offsite_-_Day_2_-_Photo_16.jpg"
end

Given /^I have a small browser window$/ do
  @browser.window.resize_to 900, 700
end

Given /^I have an average browser window$/ do
  @browser.window.resize_to 1366, 768
end

Given /^I have a large browser window$/ do
  @browser.window.resize_to 1920, 1080
end

Given /^I am using a custom user agent$/ do
  @browser = browser(test_name(@scenario), {user_agent: ENV["BROWSER_USERAGENT"]})
end

Then /^the File: page image is loaded$/ do
  on(CommonsPage) do |page|
    wait_for_image_load page, ".fullImageLink img"
    #Has to be a global variable, otherwise it doesn't survive between scenarios
    $commons_time = Time.now.getutc - @commons_open_time
    log_performance "file-page", ( $commons_time * 1000 ).to_i.to_s, "", ""
  end
end

Then /^the MMV image is loaded in (\d+) percent of the time with a (.*) cache and an? (.*) browser window$/ do |percentage, cache, window_size|
  on(E2ETestPage) do |page|
    wait_for_image_load page, ".mw-mmv-image img"
    mmv_time = Time.now.getutc - @image_click_time
    log_performance "mmv", (mmv_time * 1000).to_i.to_s, cache, window_size

    expected_time = $commons_time * ( percentage.to_f / 100.0 )
    mmv_time.should < expected_time
  end
end

def wait_for_image_load ( page, css_class )
  @browser.execute_script("
      function wait_for_image() {
          var $img = $( '" + css_class + "' );
          if ( $img.length
              && $img.attr( 'src' ).match(/Kerala/)
              && !$img.attr( 'src' ).match(/\\/220px-/) // Blurry placeholder
              && $img.prop( 'complete' ) ) {
              $( 'body' ).append( '<div class=\"mw-mmv-image-loaded-cucumber\"/>' );
          } else {
              setTimeout( wait_for_image, 10 );
          }
      }
      wait_for_image();
  ")

  Watir::Wait.until { page.mmv_image_loaded_cucumber_element.exists? }
end

def log_performance ( type, duration, cache, window_size )
  @browser.execute_script("
    var  stats = { type : '" + type + "', duration : " + duration + "};

    if ( '" + cache + "'.length ) {
      stats.cache = '" + cache + "';
    }

    if ( '" + window_size + "'.length ) {
      stats.windowSize = '" + window_size + "';
    }

    mediaWiki.eventLog.declareSchema( 'MultimediaViewerVersusPageFilePerformance',
      { schema:
        { title: 'MultimediaViewerVersusPageFilePerformance',
          properties: {
            type: { type: 'string', required: true, enum: [ 'mmv', 'file-page' ] },
            duration: { type: 'integer', required: true },
            cache: { type: 'string', required: false, enum: [ 'cold', 'warm' ] },
            windowSize: { type: 'string', required: false, enum: [ 'average', 'large'] }
        }
      },
      revision: 7907636
    });

    mw.eventLog.logEvent( 'MultimediaViewerVersusPageFilePerformance', stats );
  ")
end