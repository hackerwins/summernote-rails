require 'test/unit'
require 'summernote-rails/cleaner'

class TestSummernoteCleaner < Test::Unit::TestCase

  def test_add_missing_p_around_text
    text = 'Text <b>bold</b><br><a href="#">link</a>'
    assert_equal '<p>Text <b>bold</b><br><a href="#">link</a></p>', SummernoteCleaner.clean(text)
  end

  def test_do_nothing_if_p_is_there
    text = '<p>Text</p>'
    assert_equal '<p>Text</p>', SummernoteCleaner.clean(text)
  end

  def test_add_p_before_an_existing_p
    text = 'Text<p>Second text</p>'
    assert_equal '<p>Text</p><p>Second text</p>', SummernoteCleaner.clean(text)
  end

  def test_add_p_after_an_existing_p
    text = '<p>Text</p>Second text'
    assert_equal '<p>Text</p><p>Second text</p>', SummernoteCleaner.clean(text)
  end

  def test_add_p_before_an_ul
    text = 'Text<ul>...</ul>'
    assert_equal '<p>Text</p><ul>...</ul>', SummernoteCleaner.clean(text)
  end

  def test_add_p_before_an_ul_with_a_space
    text = 'Text <ul>...</ul>'
    assert_equal '<p>Text </p><ul>...</ul>', SummernoteCleaner.clean(text)
  end

  def test_add_p_before_h1
    text = 'Text<h1>title</h1>'
    assert_equal '<p>Text</p><h1>title</h1>', SummernoteCleaner.clean(text)
  end

  def test_add_p_after_h1
    text = '<h1>title</h1>Text'
    assert_equal '<h1>title</h1><p>Text</p>', SummernoteCleaner.clean(text)
  end

end