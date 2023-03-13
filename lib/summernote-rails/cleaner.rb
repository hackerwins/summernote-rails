require 'nokogiri'

class SummernoteCleaner
  BLOCK_TAGS = [
    'h1'.freeze,
    'h2'.freeze,
    'h3'.freeze,
    'h4'.freeze,
    'h5'.freeze,
    'h6'.freeze,
    'p'.freeze,
    'ul'.freeze,
    'ol'.freeze,
    'dl'.freeze,
    'div'.freeze
  ].freeze

  DEFAULT_BLOCK = 'p'.freeze

  def self.clean(code)
    new(code).clean
  end

  def initialize(code)
    @code = code.gsub("<p>\n</p>", "")
                .gsub("<p></p>", "")
                .gsub("<p><br></p>", "")
  end

  def clean
    fragment = Nokogiri::HTML5::DocumentFragment.parse(@code)
    not_block_elements_collection = []
    not_block_elements = []
    fragment.children.each do |child|
      if child.class == Nokogiri::XML::Element && BLOCK_TAGS.include?(child.name)
        # Block
        if not_block_elements.length > 0
          not_block_elements_collection << not_block_elements
          not_block_elements = []
        end
      else
        # Not block (text or inline element)
        not_block_elements << child
      end
    end
    not_block_elements_collection << not_block_elements if not_block_elements.length > 0

    not_block_elements_collection.each do |nodes|
      first_node = nodes.first
      new_paragraph = first_node.add_previous_sibling Nokogiri::XML::Node.new(DEFAULT_BLOCK, fragment.document)
      nodes.each do |node|
        node.parent = new_paragraph
      end
    end

    fragment.to_html
            .gsub("<p>\n</p>", "")
            .gsub("<p></p>", "")
            .gsub("<p><br></p>", "")
  end
end
