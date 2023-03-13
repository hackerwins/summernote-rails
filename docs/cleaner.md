# Cleaner

To use the `SummernoteCleaner` automatically on an attribute:

- Add an attribute of type `text` to your model (ex: `rails g migration AddContentToPosts content:text`)
- Declare it as a Summernote property in the model like below:
  ```ruby
  class Post < ApplicationRecord
    has_summernote :content
  end
  ```
 This will add a before_save callback to clean the attribute's content.