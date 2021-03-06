{% set background = 'bb' %}

{% if is_mainnode_online == 1 %}
    {% set background = 'bg-success' %}
{% elif is_mainnode_online == 0 %}
    {% set background = 'bg-danger' %}
{% endif %}

<li data-uid={{uid}} class="bb5-selector-item" >
    <p class="item-picture">
        <a title="{{label}}" href="javascript:;" class="{{ background }}">
            <img alt="{{label}}" src="{{image}}">
        </a>
    </p>
    <p><strong class="txt-highlight">{{label}}</strong></p>
    <p><strong class="txt-highlight" data-toggle="tooltip" title="{{uid}}">{{ uid | truncate(20) }}</strong></p>

    <p></p>
    <p>
        <button class="btn btn-simple btn-xs show-content-btn"><i class="fa fa-eye"></i>{{ "see" | trans }}</button>
        <button class="btn btn-simple btn-xs addandclose-btn"><i class="fa fa-plus"></i>{{ "select_and_close" | trans }}</button>
        <button class="btn btn-simple btn-xs del-content-btn"><i class="fa fa-trash-o"></i>{{"delete" | trans }}</button>
    </p>
</li>