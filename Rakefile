require 'bundler/gem_tasks'
require 'open-uri'
require 'json'

def download_release_file
  url = 'https://api.github.com/repos/summernote/summernote/releases/latest'
  asset = JSON.parse(open(url).read)['assets'].first

  if asset.nil?
    puts 'No asset found on GitHub.'
  else
    zip_url = asset['browser_download_url']
    FileUtils.rm_rf('tmp')
    FileUtils.mkdir_p('tmp')
    File.open("tmp/summernote.zip", "wb") do |saved_file|
      open(zip_url, "rb") do |read_file|
        saved_file.write(read_file.read)
      end
    end
  end

  puts 'No zip to process. Exiting...' and exit unless File.exists? 'tmp/summernote.zip'

  puts 'Unzipping "tmp/summernote.zip"...'
  `unzip -d tmp tmp/summernote.zip`
end

def clean_assets
  puts 'Cleaning old JS and CSS files...'

  `rm -rf vendor/assets/stylesheets`
  `rm -rf vendor/assets/fonts`
  `rm -rf vendor/assets/javascripts/lang`
  `rm -rf vendor/assets/javascripts/plugin`

  FileUtils.mkdir_p('vendor/assets/stylesheets')
  FileUtils.mkdir_p('vendor/assets/fonts')
  FileUtils.mkdir_p('vendor/assets/javascripts/summernote/lang')
  FileUtils.mkdir_p('vendor/assets/javascripts/summernote/plugin')
end

def fix_fonts
  puts 'Fixing font URLs in CSS files...'

  css_paths = [
    'vendor/assets/stylesheets/summernote.css',
    'vendor/assets/stylesheets/summernote.min.css',
    'vendor/assets/stylesheets/summernote-bs4.css',
    'vendor/assets/stylesheets/summernote-bs4.min.css',
    'vendor/assets/stylesheets/summernote-lite.css',
    'vendor/assets/stylesheets/summernote-lite.min.css'
  ]

  css_paths.each do |css_path|
    css_file = File.read(css_path)
    css_file = css_file.gsub(/url\(font\/(summernote.[a-z0-9#?]+)\)/, 'url(asset-path("\1"))')
    File.open(css_path, "w") {|old_css_file| old_css_file.print css_file}
  end
end

def copy_assets
  clean_assets

  puts 'Copying new JS and CSS files...'
  `cp tmp/dist/summernote.js vendor/assets/javascripts/summernote/summernote.js`
  `cp tmp/dist/summernote.min.js vendor/assets/javascripts/summernote/summernote.min.js`
  `cp tmp/dist/summernote-bs4.js vendor/assets/javascripts/summernote/summernote-bs4.js`
  `cp tmp/dist/summernote-bs4.min.js vendor/assets/javascripts/summernote/summernote-bs4.min.js`
  `cp tmp/dist/summernote-lite.js vendor/assets/javascripts/summernote/summernote-lite.js`
  `cp tmp/dist/summernote-lite.min.js vendor/assets/javascripts/summernote/summernote-lite.min.js`
  `cp tmp/dist/summernote.css vendor/assets/stylesheets/summernote.css`
  `cp tmp/dist/summernote.min.css vendor/assets/stylesheets/summernote.min.css`
  `cp tmp/dist/summernote-bs4.css vendor/assets/stylesheets/summernote-bs4.css`
  `cp tmp/dist/summernote-bs4.min.css vendor/assets/stylesheets/summernote-bs4.min.css`
  `cp tmp/dist/summernote-lite.css vendor/assets/stylesheets/summernote-lite.css`
  `cp tmp/dist/summernote-lite.min.css vendor/assets/stylesheets/summernote-lite.min.css`
  `cp -R tmp/dist/plugin/* vendor/assets/javascripts/summernote/plugin`
  `cp -R tmp/dist/lang/* vendor/assets/javascripts/summernote/lang`
  `cp -R tmp/dist/font/* vendor/assets/fonts`

  fix_fonts
end

desc "Update assets"
task 'update' do
  download_release_file
  copy_assets

  puts 'Finished!'
end
