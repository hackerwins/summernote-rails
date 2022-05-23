class SummernoteCleaner
  BLOCK_TAGS = [
    'h1',
    'h2',
    'h3',
    'h4',
    'h5',
    'h6',
    'p',
    'ul',
    'ol',
    'dl'
  ]

  def self.clean(code)
    new(code).clean
  end

  def initialize(code)
    @code = code
    @clean_code = ''
    @current_block_tag = nil
    @open_block_tag_found = nil
    @close_block_tag_found = nil
  end

  def clean
    while @code.length > 0 do
      if starts_with_open_block_tag?
        log "starts_with_open_block_tag #{@open_block_tag_found}"
        unless @current_block_tag.nil?
          log "Opening a block in a block, we need to close the previous one"
          @clean_code += close(@current_block_tag)
        end
        log "Move the open block from code to clean code"
        @clean_code += @code.slice!(0, open_current.length)
        @current_block_tag = @open_block_tag_found
        @open_block_tag_found = nil
      elsif starts_with_close_block_tag?
        log "starts_with_close_block_tag #{@close_block_tag_found}"
        if @close_block_tag_found == @current_block_tag
          log "Everything is logical, we close what was opened"
          @clean_code += @code.slice!(0, close_current.length)
        else
          log "Mismatch, the closing tag is not what it should be. We need to remove it, and add the correct one instead"
          @code.slice!(0, close(@close_block_tag_found).length)
          @clean_code += close_current
        end
        @current_block_tag = nil
        @close_block_tag_found = nil
      else
        if in_block?
          @clean_code += @code.slice!(0)
        else
          log "not in a block, we open a p"
          @current_block_tag = 'p'
          @clean_code += open_current
        end
      end
      log @clean_code
    end
    if in_block?
      log "still in a block, we close with a #{@current_block_tag}"
      @clean_code += close_current
    end
    @clean_code
  end

  protected

  def starts_with_open_block_tag?
    BLOCK_TAGS.each do |tag|
      if @code.start_with? open(tag)
        @open_block_tag_found = tag
        return true
      end
    end
    false
  end

  def starts_with_close_block_tag?
    BLOCK_TAGS.each do |tag|
      if @code.start_with? close(tag)
        @close_block_tag_found = tag
        return true
      end
    end
    return false
  end

  def in_block?
    !@current_block_tag.nil?
  end

  def open(tag)
    "<#{tag}>"
  end

  def close(tag)
    "</#{tag}>"
  end

  def open_current
    open @current_block_tag
  end

  def close_current
    close @current_block_tag
  end

  def log(string)
    # puts string
  end
end
