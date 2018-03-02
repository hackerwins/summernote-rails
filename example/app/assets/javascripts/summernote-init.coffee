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
          console.log files
          console.log 'Files were uploaded: {#files}'
          sendFile files[0], $(this)
        onMediaDelete: (target, editor, editable) ->
          console.log target
          console.log 'File was deleted : #{target}'
          upload_id = target[0].id.split('-').slice(-1)[0]
          console.log upload_id
          if !!upload_id
            deleteFile upload_id
          target.remove()
        onKeyup: (e) -> 
          if e.keyCode == 8 || e.keyCode == 46
            newValue = e.target.innerHTML
            dmp = new diff_match_patch()
            diff = dmp.diff_main(@oldValue, newValue)
            myRegexp = /\"\/uploads\/upload\/image\/(.+?)\/(.+?)\"/g
            if diff.length > 0
              if diff[1][0] == -1
                target_string = diff[1][1]
                matches = target_string.match(myRegexp)             
                for match of matches 
                  image_id = matches[match].split('/')[4]
                  if confirm("Are you sure?\nYou can't revert if images have been deleted.")
                    deleteFile image_id
                    console.log "* Permanently removed : #{matches[match]}"
            @oldValue = newValue