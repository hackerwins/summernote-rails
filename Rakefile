require "bundler/gem_tasks"

def copy_locales
  Dir["summernote/lang/*"].each do |file|
    `cp #{file} vendor/assets/javascripts/summernote/locales/#{File.basename(file).gsub('summernote-', '')}`
  end
end

desc "Update assets"
task 'update' do
  if Dir.exist?('summernote')
    system("cd summernote; git fetch")
    last_revision = `cd summernote; git describe --abbrev=0 --tags`
    system("cd summernote; git checkout #{last_revision}")
  else
    system("git clone https://github.com/summernote/summernote.git")
  end

  `cp summernote/dist/summernote.js vendor/assets/javascripts/summernote/summernote.js`
  `cp summernote/dist/summernote.css vendor/assets/stylesheets/summernote/summernote.css`

  copy_locales
end