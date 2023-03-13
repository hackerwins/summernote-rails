require 'bundler/gem_tasks'
require 'open-uri'
require 'json'
require 'rake/testtask'

Rake::TestTask.new do |t|
  t.libs << 'test'
end

desc "Run tests"
task :default => :test

def download_release_file(tag_name)
  zip_url = "https://github.com/summernote/summernote/archive/refs/tags/#{tag_name}.zip"
  FileUtils.rm_rf('tmp')
  FileUtils.mkdir_p('tmp')
  File.open("tmp/summernote.zip", "wb") do |saved_file|
    open(zip_url, "rb") do |read_file|
      saved_file.write(read_file.read)
    end
  end

  puts 'No zip to process. Exiting...' and exit unless File.exists? 'tmp/summernote.zip'

  puts 'Unzipping "tmp/summernote.zip"...'
  FileUtils.rm_rf('tmp/dist')
  `unzip -d tmp/dist tmp/summernote.zip`
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
    'vendor/assets/stylesheets/summernote-bs5.css',
    'vendor/assets/stylesheets/summernote-bs5.min.css',
    'vendor/assets/stylesheets/summernote-lite.css',
    'vendor/assets/stylesheets/summernote-lite.min.css'
  ]

  css_paths.each do |css_path|
    css_file = File.read(css_path)
    css_file = css_file.gsub(/url\(("\.\/)?font\/(summernote.[a-z0-9#?]+)(")?\)/, 'url(asset-path("\2"))')
    File.open(css_path, "w") {|old_css_file| old_css_file.print css_file}
  end
end

def copy_assets(tag_name)
  clean_assets

  puts 'Copying new JS and CSS files...'
  base_path = "tmp/dist/summernote-#{tag_name.gsub('v', '')}/dist"
  `cp #{base_path}/summernote-bs4.css vendor/assets/stylesheets/summernote-bs4.css`
  `cp #{base_path}/summernote-bs4.css.map vendor/assets/stylesheets/summernote-bs4.css.map`
  `cp #{base_path}/summernote-bs4.js vendor/assets/javascripts/summernote/summernote-bs4.js`
  `cp #{base_path}/summernote-bs4.js.map vendor/assets/javascripts/summernote/summernote-bs4.js.map`
  `cp #{base_path}/summernote-bs4.min.css vendor/assets/stylesheets/summernote-bs4.min.css`
  `cp #{base_path}/summernote-bs4.min.js vendor/assets/javascripts/summernote/summernote-bs4.min.js`

  `cp #{base_path}/summernote-bs5.css vendor/assets/stylesheets/summernote-bs5.css`
  `cp #{base_path}/summernote-bs5.css.map vendor/assets/stylesheets/summernote-bs5.css.map`
  `cp #{base_path}/summernote-bs5.js vendor/assets/javascripts/summernote/summernote-bs5.js`
  `cp #{base_path}/summernote-bs5.js.map vendor/assets/javascripts/summernote/summernote-bs5.js.map`
  `cp #{base_path}/summernote-bs5.min.css vendor/assets/stylesheets/summernote-bs5.min.css`
  `cp #{base_path}/summernote-bs5.min.js vendor/assets/javascripts/summernote/summernote-bs5.min.js`

  `cp #{base_path}/summernote-lite.css vendor/assets/stylesheets/summernote-lite.css`
  `cp #{base_path}/summernote-lite.css.map vendor/assets/stylesheets/summernote-lite.css.map`
  `cp #{base_path}/summernote-lite.js vendor/assets/javascripts/summernote/summernote-lite.js`
  `cp #{base_path}/summernote-lite.js.map vendor/assets/javascripts/summernote/summernote-lite.js.map`
  `cp #{base_path}/summernote-lite.min.css vendor/assets/stylesheets/summernote-lite.min.css`
  `cp #{base_path}/summernote-lite.min.js vendor/assets/javascripts/summernote/summernote-lite.min.js`

  `cp #{base_path}/summernote.css vendor/assets/stylesheets/summernote.css`
  `cp #{base_path}/summernote.css.map vendor/assets/javascripts/summernote/summernote.css.map`
  `cp #{base_path}/summernote.js vendor/assets/javascripts/summernote/summernote.js`
  `cp #{base_path}/summernote.js.map vendor/assets/javascripts/summernote/summernote.js.map`
  `cp #{base_path}/summernote.min.css vendor/assets/stylesheets/summernote.min.css`
  `cp #{base_path}/summernote.min.js vendor/assets/javascripts/summernote/summernote.min.js`

  `cp -R #{base_path}/plugin/* vendor/assets/javascripts/summernote/plugin`
  `cp -R #{base_path}/lang/* vendor/assets/javascripts/summernote/lang`
  `cp -R #{base_path}/font/* vendor/assets/fonts`

  fix_fonts
end

desc "Update assets"
task 'update' do
  release_url = 'https://api.github.com/repos/summernote/summernote/releases/latest'
  tag_name = JSON.parse(open(release_url).read)['tag_name']

  download_release_file tag_name
  copy_assets tag_name

  puts 'Finished!'
end
