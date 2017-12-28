class Upload < ApplicationRecord
  mount_uploader :image, ImageUploader
end
