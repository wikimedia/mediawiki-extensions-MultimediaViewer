class LoginPage
  include PageObject

  include URL
  page_url URL.url("Special:UserLogin")

  button(:login, id: "wpLoginAttempt")
  text_field(:password, id: "wpPassword1")
  text_field(:username, id: "wpName1")

  def logged_in_as_element
    @browser.div(id: "mw-content-text").p.b
  end
  def login_with(username, password)
    self.username_element.when_present.send_keys(username)
    self.password_element.when_present.send_keys(password)
    login_element.fire_event("onfocus")
    login_element.when_present.click
  end
end


