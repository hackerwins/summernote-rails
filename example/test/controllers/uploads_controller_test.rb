require 'test_helper'

class UploadsControllerTest < ActionDispatch::IntegrationTest
  test "should get create" do
    get uploads_create_url
    assert_response :success
  end

  test "should get destroy" do
    get uploads_destroy_url
    assert_response :success
  end

end
