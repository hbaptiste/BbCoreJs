<li data-uid={{uid}} class="bb5-selector-item">
    <p><a title="{{title}}" href="javascript:;"><img alt="{{title}}" src="{{image}}"></a></p>
    <p><a title="{{title}}" href="javascript:;">{{title}}</a></p>
    <p>
        <button class="btn btn-simple btn-xs show-media-btn"><i class="fa fa-eye"></i>{{ "see" | trans }}</button>
        <button class="btn btn-simple btn-xs del-media-btn"><i class="fa fa-trash-o"></i>{{"delete" | trans}}</button>
    </p>
    <p>
          {% if content.extra %}
             {% if content.extra.image_width %}
                <span>L : {{content.extra.image_width}}px, H : {{content.extra.image_height}}px, {{content.extra.file_size | bytesToSize}} </span>
            {% else %}
                <span> {{content.extra.filesize}} </span>
            {% endif %}
          {% endif %}
    </p>
</li>
