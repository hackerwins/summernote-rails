require "bundler/gem_tasks"
require "json"

def download_release_file
  url = 'https://api.github.com/repos/summernote/summernote/releases/latest'
  tarball_url = JSON.parse(open(url).read)['tarball_url']

  FileUtils.mkdir_p("tmp/summernote")
  File.open("tmp/summernote.tar.gz", "wb") do |saved_file|
    open(tarball_url, "rb") do |read_file|
      saved_file.write(read_file.read)
    end
  end

  `tar xzvf tmp/summernote.tar.gz -C tmp/summernote --strip-components=1`
end

def clean_assets
  `rm -rf vendor/assets/javascripts/locales`
  `rm -rf vendor/assets/javascripts/plugin`
  FileUtils.mkdir_p("vendor/assets/javascripts/summernote/locales")
  FileUtils.mkdir_p("vendor/assets/javascripts/summernote/plugin")
end

def copy_assets
  clean_assets

  `cp tmp/summernote/dist/summernote.js vendor/assets/javascripts/summernote/summernote.js`
  `cp tmp/summernote/dist/summernote.css vendor/assets/stylesheets/summernote/summernote.css`

  Dir["tmp/summernote/plugin/*"].each do |file|
    `cp #{file} vendor/assets/javascripts/summernote/plugin/#{File.basename(file)}`
  end

  Dir["tmp/summernote/lang/*"].each do |file|
    `cp #{file} vendor/assets/javascripts/summernote/locales/#{File.basename(file).gsub('summernote-', '')}`
  end
end

desc "Update assets"
task 'update' do
  download_release_file
  copy_assets
end