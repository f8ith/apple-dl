from apple_dl.apple_music_api  import downloader_song, parse_url_info_utf8

info = parse_url_info_utf8("https://music.apple.com/hk/album/%E5%A4%8F%E6%97%A5%E4%B9%8B%E5%AD%90/1823170865?i=1823170868") 
print(info)