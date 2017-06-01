<?php
namespace WatsonConv;

class Frontend {
    public static function load_styles() {
        wp_enqueue_style('chat-style', WATSON_CONV_URL.'styles.css', array('dashicons'));

        $font_size = get_option('watsonconv_font_size', 11);
        $color = get_option('watsonconv_color', '#23282d');
        $messages_height = get_option('watsonconv_size', 200);

        switch (get_option('watsonconv_position', 'bottom_right')) {
            case 'top_left':
                $position = 'top: 10vmin; left: 10vmin;';
                break;
            case 'top_right':
                $position = 'top: 10vmin; right: 10vmin;';
                break;
            case 'bottom_left':
                $position = 'bottom: 10vmin; left: 10vmin;';
                break;
            case 'bottom_right':
                $position = 'bottom: 10vmin; right: 10vmin;';
                break;
        }

        if(array_sum(sscanf($color, "#%02x%02x%02x")) > 500){
            $text_color = 'black';
        } else {
            $text_color = 'white';
        }

        wp_add_inline_style('chat-style', '
            .popup-box-wrapper
            {
                '.$position.'
            }
            .popup-box
            {
                font-size: '.$font_size.'pt;
                width: '.(0.825*$messages_height + 4.2*$font_size).'pt;
            }
            .popup-box .popup-head
            {
                background-color: '.$color.';
                color: '.$text_color.';
            }
            .popup-box .popup-messages
            {
                height: '.$messages_height.'pt
            }
            .popup-box .popup-message-input
            {
                font-size: '.$font_size.'pt;
            }
            .popup-box .popup-messages .watson-message
            {
                float: left;
                background-color: '.$color.';
                color: '.$text_color.';
            }
        ');
    }

    public static function render_chat_box() {
        $page_selected =
            is_page(get_option('watsonconv_pages', -1)) ||
            is_single(get_option('watsonconv_posts', -1)) ||
            in_category(get_option('watsonconv_categories', -1));

        if ($page_selected == (get_option('watsonconv_show_on', 'all_except') == 'only') &&
            (get_option('watsonconv_total_requests', 0) < get_option('watsonconv_limit') ||
                get_option('watsonconv_use_limit', false) == false) &&
            !empty(get_option('watsonconv_id')) &&
            !empty(get_option('watsonconv_username')) &&
            !empty(get_option('watsonconv_password'))) {
        ?>
            <div id="chat-box"></div>
        <?php
            $settings = array(
                'delay' => (int) get_option('watsonconv_delay', 0),
                'minimized' => get_option('watsonconv_minimized', false),
                'is_bottom' => substr(get_option('watsonconv_position', 'bottom_right'), 0, 6) == 'bottom'
            );

            wp_enqueue_script('chat-app', WATSON_CONV_URL.'app.js');
            wp_localize_script('chat-app', 'settings', $settings);
        }
    }
}