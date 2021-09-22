<?php
namespace WatsonConv\Settings;

class Product {
    const SLUG = 'watson_product_addon_for_chat';

    public static function init_page() {
        add_submenu_page(
            Main::SLUG,
            'Set Up Product Search',
            'Set Up Product Search',
            'manage_options',
            self::SLUG,
            array (__CLASS__, 'render_page')
        );
    }

    public static function init_settings() {
        self::init_credential_settings();
    }

    public static function render_page() { ?>
        <div class="wrap_product_search_for_chat">
            <h2><?php esc_html_e('Set Up Product Search'); ?></h2>
            <?php settings_errors();
            self::render_content_setting_page(); ?>
        </div>
    <?php }

    public static function render_content_setting_page() { ?>

        <h2 class="tab_wrapper_product_search_for_chat">
            <a onClick="switch_tab_product_search_for_chat('setup')" class="nav-tab nav-tab-active setup_tab">Product Search Setup</a>
            <a onClick="switch_tab_product_search_for_chat('workspace')" class="nav-tab workspace_tab">Product Search Options</a>
        </h2>

        <form action="options.php" method="POST">
            <div class="tab-page setup_page">
                <?php $status_woocommerce = is_plugin_active('woocommerce/woocommerce.php');
                $status_watson = is_plugin_active('conversation-watson/watson.php');
                if ( $status_woocommerce && $status_watson ):?>
                    <p class="message success">All conditions for activation are met. You can proceed to the next step of configuring the addon.</p>
                <?php else:?>
                    <p class="message error">The activation conditions have not been met. Activate the required plugins. if they are missing, install them. You can activate plugins <a href="<?php echo get_home_url() . '/wp-admin/plugins.php';?>">here</a>.</p>
                <?php endif;?>
                <ul class="list_n_plugins">
                    <li class="item_list woocommerce">
                        <div class="checkbox_wrap">
                            <?php echo ( $status_woocommerce ? '<span class="dashicons dashicons-yes"></span>' : '<span class="dashicons dashicons-no"></span>');?>
                        </div>
                        <a href="https://downloads.wordpress.org/plugin/woocommerce.zip">Woocommerce</a>
                    </li>
                </ul>
                <div class="wrap_btn">
                    <a onClick="switch_tab_pr_add_chat('workspace')" class="btn_next_tab">Next</a>
                </div>
            </div>

            <?php settings_fields(self::SLUG); ?>

            <div class="tab-page workspace_page" style="display: none">

                <?php do_settings_sections(self::SLUG) ?>
                <?php submit_button(); ?>

            </div>
        </form>

    <?php }

    // ------------ Workspace Credentials ---------------

    // If an installation of this plugin has a credentials format from the versions before 0.3.0,
    // migrate them to the new format.

    public static function init_credential_settings() {

        $settings_page = self::SLUG;

        add_settings_section('chatbot_watson_product_search_credentials', 'Product Addon For Chat Credentials',
            array(__CLASS__, 'workspace_description'), $settings_page);

        add_settings_field('chatbot_watson_product_search_enabled', 'Enabled Search Product', array(__CLASS__, 'render_enabled'),
            $settings_page, 'chatbot_watson_product_search_credentials');

        add_settings_field('chatbot_watson_product_search_product_links', 'Show product links in search results', array(__CLASS__, 'render_product_links'),
            $settings_page, 'chatbot_watson_product_search_credentials');

        add_settings_field('chatbot_watson_product_search_image_product', 'Show image product in search results', array(__CLASS__, 'render_image_product'),
            $settings_page, 'chatbot_watson_product_search_credentials');

        add_settings_field('chatbot_watson_product_search_count_of_items', 'Show count of items in stock in search results', array(__CLASS__, 'render_count_of_items'),
            $settings_page, 'chatbot_watson_product_search_credentials');

        add_settings_field('chatbot_watson_product_search_count_of_items_in_search_results', 'Count of items in search results', array(__CLASS__, 'render_count_of_items_in_search_results'),
            $settings_page, 'chatbot_watson_product_search_credentials');

        add_settings_field('chatbot_watson_product_search_show_search_button', 'Show search button in control list', array(__CLASS__, 'render_show_search_button'),
            $settings_page, 'chatbot_watson_product_search_credentials');

        add_settings_field('chatbot_watson_product_search_server_return_text', 'It text, that server return user', array(__CLASS__, 'render_server_return_text'),
            $settings_page, 'chatbot_watson_product_search_credentials');

        add_settings_field('chatbot_watson_product_search_server_return_text_product_not_found', 'It text, that server return user if product not found', array(__CLASS__, 'render_server_return_text_product_not_found'),
            $settings_page, 'chatbot_watson_product_search_credentials');

        register_setting(self::SLUG, 'chatbot_watson_product_search_credentials', array(__CLASS__, 'validate_credentials'));

    }

    public static function validate_credentials($credentials) {

        $old_credentials = get_option('chatbot_watson_product_search_credentials');

        if (!isset($credentials['enabled'])) {
            $old_credentials['enabled'] = 'false';
            return $old_credentials;
        }

        if ($credentials['count_of_items_in_search_results'] < 0 ) {
            add_settings_error('watson_product_addon_for_chat_credentials', 'invalid-count-of-items-in-search-results', 'Incorrect value of the count of products in the search result.');
            return $old_credentials;
        }

        if ($credentials == $old_credentials) {
            return $credentials;
        }

        add_settings_error(
            'watson_product_addon_for_chat_credentials',
            'valid-credentials',
            'Options has been saved.',
            'updated'
        );

        return $credentials;

    }

    public static function workspace_description($args) {

    }

    public static function render_enabled() {
        $credentials = get_option('chatbot_watson_product_search_credentials');
        $enabled = (isset($credentials['enabled']) ? $credentials['enabled'] : 'true') == 'true';
        ?>
        <fieldset>
            <input
                    type="checkbox" id="chatbot_watson_product_search_enabled"
                    name="chatbot_watson_product_search_credentials[enabled]"
                    value="true"

                <?php echo $enabled ? 'checked' : '' ?>
            />
            <label for="chatbot_watson_product_search_enabled">
                Enable
            </label>
        </fieldset>
        <?php
    }

    public static function render_product_links() {
        $credentials = get_option('chatbot_watson_product_search_credentials');
        $enabled = (isset($credentials['product_links']) ? $credentials['product_links'] : "true");

        ?>

        <fieldset class="view_column">
            <label for="chatbot_watson_product_search_product_links_y">
                <input
                        type="radio" id="chatbot_watson_product_search_product_links_y"
                        name="chatbot_watson_product_search_credentials[product_links]"
                        value="true"

                    <?php echo $enabled == "true" ? "checked" : "" ?>
                />
                Yes
            </label>

            <label for="chatbot_watson_product_search_product_links_n">
                <input
                        type="radio" id="chatbot_watson_product_search_product_links_n"
                        name="chatbot_watson_product_search_credentials[product_links]"
                        value="false"

                    <?php echo $enabled == "false" ? "checked" : "" ?>
                />
                No
            </label>
        </fieldset>

        <?php
    }

    public static function render_image_product() {
        $credentials = get_option('chatbot_watson_product_search_credentials');
        $enabled = (isset($credentials['image_product']) ? $credentials['image_product'] : "true");
        ?>
        <fieldset class="view_column">
            <label for="chatbot_watson_product_search_image_product_y">
                <input
                        type="radio" id="chatbot_watson_product_search_image_product_y"
                        name="chatbot_watson_product_search_credentials[image_product]"
                        value="true"

                    <?php echo $enabled == "true" ? "checked" : "" ?>
                />
                Yes
            </label>

            <label for="chatbot_watson_product_search_image_product_n">
                <input
                        type="radio" id="chatbot_watson_product_search_image_product_n"
                        name="chatbot_watson_product_search_credentials[image_product]"
                        value="false"

                    <?php echo $enabled == "false" ? "checked" : "" ?>
                />
                No
            </label>
        </fieldset>
        <?php
    }

    public static function render_count_of_items() {
        $credentials = get_option('chatbot_watson_product_search_credentials');
        $enabled = (isset($credentials['count_of_items']) ? $credentials['count_of_items'] : "true");
        ?>
        <fieldset class="view_column">
            <label for="chatbot_watson_product_search_count_of_items_y">
                <input
                        type="radio" id="chatbot_watson_product_search_count_of_items_y"
                        name="chatbot_watson_product_search_credentials[count_of_items]"
                        value="true"

                    <?php echo $enabled == "true" ? "checked" : "" ?>
                />
                Yes
            </label>

            <label for="chatbot_watson_product_search_count_of_items_n">
                <input
                        type="radio" id="chatbot_watson_product_search_count_of_items_n"
                        name="chatbot_watson_product_search_credentials[count_of_items]"
                        value="false"

                    <?php echo $enabled == "false" ? "checked" : "" ?>
                />
                No
            </label>
        </fieldset>
        <?php
    }

    public static function render_count_of_items_in_search_results() {
        $credentials = get_option('chatbot_watson_product_search_credentials');
        ?>
        <fieldset>
            <input
                    type="number" id="chatbot_watson_product_search_count_of_items_in_search_results"
                    name="chatbot_watson_product_search_credentials[count_of_items_in_search_results]"
                    min="0"
                    max="100"
                    value="<?php echo (isset($credentials['count_of_items_in_search_results']) ? esc_html($credentials['count_of_items_in_search_results']) : 0 );?>"
            />
            <label for="chatbot_watson_product_search_count_of_items_in_search_results"></label>
        </fieldset>
        <?php
    }

    public static function render_search_command() {
        $credentials = get_option('chatbot_watson_product_search_credentials');
        ?>
        <fieldset>
            <input
                    type="text" id="chatbot_watson_product_search_search_command"
                    name="chatbot_watson_product_search_credentials[search_command]"
                    placeholder="/search_product"
                    value="<?php echo (isset($credentials['search_command']) ? esc_html($credentials['search_command']) : '' );?>"
            />
            <label for="chatbot_watson_product_search_search_command"></label>
        </fieldset>
        <?php
    }

    public static function render_show_search_button() {
        $credentials = get_option('chatbot_watson_product_search_credentials');
        $enabled = (isset($credentials['show_search_button']) ? $credentials['show_search_button'] : "true");

        ?>

        <fieldset class="view_column">
            <label for="chatbot_watson_product_search_show_search_button_y">
                <input
                        type="radio" id="chatbot_watson_product_search_show_search_button_y"
                        name="chatbot_watson_product_search_credentials[show_search_button]"
                        value="true"

                    <?php echo $enabled == "true" ? "checked" : "" ?>
                />
                Yes
            </label>

            <label for="chatbot_watson_product_search_show_search_button_n">
                <input
                        type="radio" id="chatbot_watson_product_search_show_search_button_n"
                        name="chatbot_watson_product_search_credentials[show_search_button]"
                        value="false"

                    <?php echo $enabled == "false" ? "checked" : "" ?>
                />
                No
            </label>
        </fieldset>

        <?php
    }

    public static function render_server_return_text() {
        $credentials = get_option('chatbot_watson_product_search_credentials');
        $input_text = isset($credentials['server_return_text']) ? $credentials['server_return_text'] : '';
        ?>
        <fieldset>
            <textarea
                    id="chatbot_watson_product_search_server_return_text"
                    type="text"
                    name="chatbot_watson_product_search_credentials[server_return_text]"
                    placeholder="<?php echo __('You clicked the inline button, enter the name of the product.');?>"
                    value="<?php echo (isset($credentials['server_return_text']) ? esc_html($credentials['server_return_text']) : '' );?>"
            ><?php echo esc_html($input_text);?></textarea>
            <label for="chatbot_watson_product_search_server_return_text"></label>
        </fieldset>
        <?php
    }

    public static function render_server_return_text_product_not_found() {
        $credentials = get_option('chatbot_watson_product_search_credentials');
        $input_text = isset($credentials['server_return_text_product_not_found']) ? $credentials['server_return_text_product_not_found'] : '';
        ?>
        <fieldset>
            <textarea
                    id="chatbot_watson_product_search_server_return_text_product_not_found"
                    type="text"
                    name="chatbot_watson_product_search_credentials[server_return_text_product_not_found]"
                    placeholder="<?php echo __('No products found.');?>"
                    value="<?php echo (isset($credentials['server_return_text_product_not_found']) ? esc_html($credentials['server_return_text_product_not_found']) : '' );?>"
            ><?php echo esc_html($input_text);?></textarea>
            <label for="chatbot_watson_product_search_server_return_text_product_not_found"></label>
        </fieldset>
        <?php
    }

}
