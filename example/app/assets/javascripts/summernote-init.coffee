sendFile = (file, toSummernote) ->
  data = new FormData
  data.append 'upload[image]', file
  $.ajax
    data: data
    type: 'POST'
    url: '/uploads'
    cache: false
    contentType: false
    processData: false
    success: (data) ->
      img = document.createElement('IMG')
      img.src = data.url
      console.log data
      img.setAttribute('id', "sn-image-#{data.upload_id}")
      toSummernote.summernote 'insertNode', img
      toSummernote[0].oldValue = $('.note-editable.card-block')[0].innerHTML
      # console.log $('.note-editable.card-block')[0].innerHTML

deleteFile = (file_id) ->
  $.ajax
    type: 'DELETE'
    url: "/uploads/#{file_id}"
    cache: false
    contentType: false
    processData: false

Array::diff = (a) ->
  @filter (i) ->
    a.indexOf(i) < 0    

$(document).on 'turbolinks:load', ->
  $('[data-provider="summernote"]').each ->
    $(this).summernote
      lang: 'ko-KR'
      height: 400
      callbacks:
        onInit: ->
          console.log('Summernote is launched');
          @oldValue = this.value
        onImageUpload: (files, e) ->
          console.log "Files were uploaded: "
          console.log files
          sendFile files[0], $(this)
        onMediaDelete: (target, editor, editable) ->
          console.log target
          console.log "File was deleted : #{target}"
          upload_id = target[0].id.split('-').slice(-1)[0]
          console.log upload_id
          if !!upload_id
            deleteFile upload_id
            @oldValue = $('.note-editable.card-block')[0].innerHTML
          target.remove()
        onKeyup: (e) -> 
          if e.keyCode == 8 || e.keyCode == 46
            newValue = e.target.innerHTML
            oldImages = @oldValue.match(/<img\s(?:.+?)>/g)
            oldImages = if oldImages then oldImages else []
            newImages = newValue.match(/<img\s(?:.+?)>/g)
            newImages = if newImages then newImages else []
            # console.log @oldValue
            # console.log newValue
            # console.log oldImages
            # console.log newImages
            @oldValue = newValue
            deletedImages = if newImages then oldImages.diff(newImages) else [] 
            if deletedImages.length > 0
              # console.log "deleted images :"
              # console.log deletedImages
              for deletedImage in deletedImages  
                myRegexp = /\/uploads\/upload\/image\/(.+?)\/(.+?)\"/g
                # console.log deletedImage
                matches = myRegexp.exec deletedImage
                # console.log matches
                if confirm("Are you sure?\nYou can't revert if images have been deleted.")
                  deleteFile matches[1]
                  console.log "* Permanently removed : #{matches[1]}: #{matches[2]}"