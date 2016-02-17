## Publish new version

### 1. Update summernote assets

```bash
bundle exec rake update
```

Modify `summernote.css` font-face path
`url("font/summernote.eot?ad8d7e2d177d2473aecd9b35d16211fb")` to `url(font-path("summernote.eot")`, all other font path update same

// TODO : automation using rake

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
