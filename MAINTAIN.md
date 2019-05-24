## Publish new version

### 1. Update summernote assets

```bash
bundle exec rake update
```

### 2. Update gem version number

Edit `lib/summernote-rails/version.rb`

```ruby
module SummernoteRails
  module Rails
    VERSION = "x.y.z.0"
  end
end
```

### 3. Publish

Publish on rubygems
```bash
bundle exec rake release
```

this command git tagging and publish
