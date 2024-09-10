#!/usr/bin/env ruby

title_en = ARGV[0]
title_fr = ARGV[0]

unless title_en
    loop do
        print "\nTitle (en) ? > "
        title_en = gets.chomp
        break if title_en != "" and title_en != nil
    end
end

unless title_fr
    loop do
        print "\nTitle (fr) ? > "
        title_fr = gets.chomp
        break if title_fr != "" and title_fr != nil
    end
end

date_simple = Time.now.strftime("%Y-%m-%d")
date_full = Time.now.strftime("%Y-%m-%d %H:%M:%S %z")

print "Date (simple): #{date_simple}"
print "Date (full): #{date_full}"

title_en_simple = title_en.downcase.gsub(/[^a-zA-Z0-9]+/i, "-").gsub(/--+|^-|-$/, "")
title_fr_simple = title_fr.downcase.gsub(/[^a-zA-Z0-9]+/i, "-").gsub(/--+|^-|-$/, "")

template_en = """\
---
layout: post
title:  '#{title_en}'
date:   #{date_full}
lang:   en
lang-ref: #{title_en_simple}
---

Hello world!
"""
template_fr = """\
---
layout: post
title:  '#{title_fr}'
date:   #{date_full}
lang:   fr
lang-ref: #{title_en_simple}
---

Bonjour Monde !
"""

filename_en = "#{date_simple}-#{title_en_simple}.md"
filename_fr = "#{date_simple}-#{title_fr_simple}.md"

new_file_en = File.new("_posts/#{filename_en}", "w")
new_file_fr = File.new("fr/_posts/#{filename_fr}", "w")

new_file_en.puts(template_en)
new_file_fr.puts(template_fr)

print "En:"
print "\nTitle: #{filename_en}"
print "\nTemplate:#{template_en}"
print "\n\n"
print "Fr:"
print "Title: #{filename_fr}"
print "\nTemplate:#{template_fr}"
print "\n\nYou can now edit your new article!"
