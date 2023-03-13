require 'test/unit'
require 'summernote-rails/cleaner'

class TestSummernoteCleaner < Test::Unit::TestCase

  def test_add_missing_p_around_text
    text = 'Text <b>bold</b><br><a href="#">link</a>'
    assert_equal '<p>Text <b>bold</b><br><a href="#">link</a></p>', SummernoteCleaner.clean(text)
  end

  def test_add_missing_p_around_text_before_clean_paragraph
    text = 'Text <b>bold</b><br><a href="#">link</a><p><b>Lorem ipsum</b> dolor sit amet</p>'
    assert_equal '<p>Text <b>bold</b><br><a href="#">link</a></p><p><b>Lorem ipsum</b> dolor sit amet</p>', SummernoteCleaner.clean(text)
  end

  def test_add_missing_p_around_text_around_clean_paragraph
    text = 'Text <b>bold</b><br><a href="#">link</a><p><b>Lorem ipsum</b> dolor sit amet</p>Text <b>bold</b><br><a href="#">link</a>'
    assert_equal '<p>Text <b>bold</b><br><a href="#">link</a></p><p><b>Lorem ipsum</b> dolor sit amet</p><p>Text <b>bold</b><br><a href="#">link</a></p>', SummernoteCleaner.clean(text)
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

  def test_removes_empty_paragraphs
    text = "<p>test</p><p></p><p><br></p><p>\n</p>"
    assert_equal '<p>test</p>', SummernoteCleaner.clean(text)
  end

  def test_closing_paragraph
    text = "test</p><p>test 2</p>"
    assert_equal '<p>test</p><p>test 2</p>', SummernoteCleaner.clean(text)
  end

  def test_closing_paragraph_after_clean_paragraph
    text = "<p>test</p></p><p>test 2</p>"
    assert_equal '<p>test</p><p>test 2</p>', SummernoteCleaner.clean(text)
  end

  def test_nested_paragraphs
    text = "<p>test<p>test2</p></p>"
    assert_equal '<p>test</p><p>test2</p>', SummernoteCleaner.clean(text)
  end

  def test_paragraphs_inside_div
    text = "<div><p>test</p><p>test2</p></div>"
    assert_equal '<div><p>test</p><p>test2</p></div>', SummernoteCleaner.clean(text)
  end

  def test_nested_paragraphs_inside_div
    text = "<div><p>test<p>test2</p></p></div>"
    assert_equal '<div><p>test</p><p>test2</p></div>', SummernoteCleaner.clean(text)
  end

end