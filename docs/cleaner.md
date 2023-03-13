# Cleaner

To use the `SummernoteCleaner` automatically on an attribute, declare it as below in the model:

```ruby
class Post < ApplicationRecord
  has_summernote :content
end
```

This will add a before_save callback to clean the attribute's content.