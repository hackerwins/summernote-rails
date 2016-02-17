require "bundler/gem_tasks"
require "json"

def download_release_file
  url = 'https://api.github.com/repos/summernote/summernote/releases/latest'
  zip_url = JSON.parse(open(url).read)['assets'].first['browser_download_url']

  FileUtils.rm_rf("tmp")
  FileUtils.mkdir_p("tmp")
  File.open("tmp/summernote.zip", "wb") do |saved_file|
    open(zip_url, "rb") do |read_file|
      saved_file.write(read_file.read)
    end
  end

  `unzip -d tmp tmp/summernote.zip`
end

def clean_assets
  `rm -rf vendor/assets/stylesheets`
  `rm -rf vendor/assets/fonts`
  `rm -rf vendor/assets/javascripts/locales`
  `rm -rf vendor/assets/javascripts/plugin`

  FileUtils.mkdir_p("vendor/assets/stylesheets")
  FileUtils.mkdir_p("vendor/assets/fonts")
  FileUtils.mkdir_p("vendor/assets/javascripts/summernote/locales")
  FileUtils.mkdir_p("vendor/assets/javascripts/summernote/plugin")
end

def copy_assets
  clean_assets

  `cp tmp/dist/summernote.js vendor/assets/javascripts/summernote/summernote.js`
  `cp tmp/dist/summernote.css vendor/assets/stylesheets/summernote.css`
  `cp -R tmp/dist/font/* vendor/assets/fonts`

  Dir["tmp/dist/plugin/*"].each do |file|
    `cp -R #{file}/ vendor/assets/javascripts/summernote/plugin/#{File.basename(file)}`
  end

  Dir["tmp/dist/lang/*"].each do |file|
    `cp #{file} vendor/assets/javascripts/summernote/locales/#{File.basename(file).gsub('summernote-', '')}`
  end
end

desc "Update assets"
task 'update' do
  download_release_file
  copy_assets
end
