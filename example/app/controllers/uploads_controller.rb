class UploadsController < ApplicationController

  def create
    @upload = Upload.new(upload_params)
    @upload.save

    respond_to do |format|
      format.json { render :json => { url: @upload.image.url, upload_id: @upload.id } }
    end
  end

  def destroy
    @upload = Upload.find(params[:id])
    @remember_id = @upload.id
    @upload.destroy
    FileUtils.remove_dir("#{Rails.root}/public/uploads/upload/image/#{@remember_id}")
    respond_to do |format|
      format.json { render :json => { status: :ok } }
    end
  end

  private

  def upload_params
    params.require(:upload).permit(:image)
  end
end
