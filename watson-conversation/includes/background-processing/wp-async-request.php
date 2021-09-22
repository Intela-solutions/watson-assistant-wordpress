<?php
/**
 * WP Async Request
 *
 * @package WP-Background-Processing
 */

if ( ! class_exists( 'WP_Async_Request' ) ) {

	/**
	 * Abstract WP_Async_Request class.
	 *
	 * @abstract
	 */
	abstract class WP_Async_Request {

		/**
		 * Prefix
		 *
		 * (default value: 'wp')
		 *
		 * @var string
		 * @access protected
		 */
		protected $prefix = 'wp';

		/**
		 * Action
		 *
		 * (default value: 'async_request')
		 *
		 * @var string
		 * @access protected
		 */
		protected $action = 'async_request';

		/**
		 * Identifier
		 *
		 * @var mixed
		 * @access protected
		 */
		protected $identifier;

		/**
		 * Data
		 *
		 * (default value: array())
		 *
		 * @var array
		 * @access protected
		 */
		protected $data = array();

		/**
		 * Initiate new async request
		 */
		public function __construct() {
			$this->identifier = $this->prefix . '_' . $this->action;

			add_action( 'wp_ajax_' . $this->identifier, array( $this, 'maybe_handle' ) );
			add_action( 'wp_ajax_nopriv_' . $this->identifier, array( $this, 'maybe_handle' ) );
            add_action('wp_ajax_psfc_search_product',  array( $this, 'psfc_search_product' ));
            add_action('wp_ajax_nopriv_psfc_search_product', array( $this, 'psfc_search_product' ));
		}

		/**
		 * Set data used during the request
		 *
		 * @param array $data Data.
		 *
		 * @return $this
		 */
		public function data( $data ) {
			$this->data = $data;

			return $this;
		}

		/**
		 * Dispatch the async request
		 *
		 * @return array|WP_Error
		 */
		public function dispatch() {
			$url  = add_query_arg( $this->get_query_args(), $this->get_query_url() );
			$args = $this->get_post_args();

			return wp_remote_post( esc_url_raw( $url ), $args );
		}

		/**
		 * Get query args
		 *
		 * @return array
		 */
		protected function get_query_args() {
			if ( property_exists( $this, 'query_args' ) ) {
				return $this->query_args;
			}

			return array(
				'action' => $this->identifier,
				'nonce'  => wp_create_nonce( $this->identifier ),
			);
		}

		/**
		 * Get query URL
		 *
		 * @return string
		 */
		protected function get_query_url() {
			if ( property_exists( $this, 'query_url' ) ) {
				return $this->query_url;
			}

			return admin_url( 'admin-ajax.php' );
		}

		/**
		 * Get post args
		 *
		 * @return array
		 */
		protected function get_post_args() {
			if ( property_exists( $this, 'post_args' ) ) {
				return $this->post_args;
			}

			return array(
				'timeout'   => 0.01,
				'blocking'  => false,
				'body'      => $this->data,
				'cookies'   => $_COOKIE,
				'sslverify' => apply_filters( 'https_local_ssl_verify', false ),
			);
		}

		/**
		 * Maybe handle
		 *
		 * Check for correct nonce and pass to handler.
		 */
		public function maybe_handle() {
			// Don't lock up other requests while processing
			session_write_close();

			check_ajax_referer( $this->identifier, 'nonce' );

			$this->handle();

			wp_die();
		}

        public function psfc_search_product() {

            $search_query = sanitize_text_field($_POST['message']);

            $credentials = get_option('chatbot_watson_product_search_credentials');
            $show_product_links                    = (isset($credentials['product_links']) ? $credentials['product_links'] : "true");
            $show_image_product                    = (isset($credentials['image_product']) ? $credentials['image_product'] : "true");
            $show_count_of_items                   = (isset($credentials['count_of_items']) ? $credentials['count_of_items'] : "true");
            $count_of_items_in_search_results      = (isset($credentials['count_of_items_in_search_results']) ? $credentials['count_of_items_in_search_results'] : 0 );
            $server_return_text_product_not_found  =  (isset($credentials['server_return_text_product_not_found']) && $credentials['server_return_text_product_not_found'] != "" ? $credentials['server_return_text_product_not_found'] : "No products found." );
            $html_response = "";

            $args = array(
                'posts_per_page' => $count_of_items_in_search_results,
                'post_type' => 'product',
                'post_status' => 'publish',
                's' => $search_query
            );
            $query = new WP_Query( $args );

            if ( $query->have_posts() ) {
                while ( $query->have_posts() ) {
                    $query->the_post();
                    $image = "";
                    $stock = "";
                    global $product;
                    if ( $show_count_of_items == "true" ) {
                        $stock = __("Stock quantity: ") . $product->get_stock_quantity();
                        $stock = "<span class=\"product_stock\">". esc_html($stock) ."</span>";
                    }
                    if ( $show_image_product == "true" ) {
                        $image_url = wp_get_attachment_image_src( get_post_thumbnail_id( get_the_ID() ));
                        $image = ($image_url[0]!='')?"<span class=\"wrap_img\"><img src=\"" . esc_url($image_url[0]) . "\" alt=\"product_img\"></span>":'';
                    }
                    $product_link = get_permalink( get_the_ID() );
                    $product_title = get_the_title( get_the_ID() );
                    if ( $show_product_links == "true" ) {
                        $html_response .= "<a href=\"". esc_url($product_link) ."\" target=\"_blank\" class=\"psfc_product_item\">
                        $image
                        <span class=\"product_title\">". esc_html($product_title) ."</span>
                        $stock
                    </a>";
                    } else {
                        $html_response .= "<div class=\"psfc_product_item\">
                        $image
                        <span class=\"product_title\">". esc_html($product_title) ."</span>
                        $stock
                    </div>";
                    }
                }
            } else {
                $html_response .= $server_return_text_product_not_found;
            }

            wp_reset_postdata();

            echo $html_response;

            wp_die();

        }

		/**
		 * Handle
		 *
		 * Override this method to perform any actions required
		 * during the async request.
		 */
		abstract protected function handle();

	}
}
