(function($){
    $(document).ready(function(){

        $(document).on('click', '#watson-box .btn-show-control-list', function(e){
            e.preventDefault();
            var arr_control_buttons = watsonconv_global.watsonconv_control_list;
            var html_response = "";
            for ( var key in arr_control_buttons ) {
                arr_control_buttons[key].forEach( (element) => {
                    html_response += "<a data-message='" + element[2] + "' data-comand='" + element[1] + "' class='btn-control'>" + element[0] + "</a>";
                });
            }
            $('#watson-box .control-list').html(html_response);
            let status = $(this).parent().hasClass('show');
            if ( status ) {
                $('#watson-box .control-list').hide();
                $(this).parent().removeClass('show');
            } else {
                $('#watson-box .control-list').show();
                $(this).parent().addClass('show');
            }
        });

        $(document).on('click', '#watson-box .control-list .btn-control', function(e){
            e.preventDefault();
            var data_control = $(this).data('comand');
            var local_storage = [];
            var arr_control_buttons = watsonconv_global.watsonconv_control_list;
            var message = $(this).data('message');
            local_storage.push({
                from: "watson",
                content: [{response_type: "text", text: message}],
            });
            localStorage.setItem("product_search_for_chat", JSON.stringify(local_storage));
            var html = `<div><div class=\"message watson-message watson-font tmp-message\">${message}</div></div>`;
            $('#watson-box #messages').append(html);
            $('#watson-box #messages').animate({
                scrollTop: $('#watson-box #messages').prop('scrollHeight')
            }, 1000);
            $('#watson-box .message-form .message-input').attr('data-control', data_control);
            $('#watson-box .control-list').hide();
            $('#watson-box .wrap-btn-control').removeClass('show');
        });
    });
})(jQuery);

