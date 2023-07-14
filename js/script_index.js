$('#form-login').on('submit', function(event) {
    event.preventDefault();
    $.post($(this).attr('action'), $(this).serialize())
        .done(function(response) {
            window.location.href = `/html/manager.html?access=${response.access}&refresh=${response.refresh}`;
        })
        .fail(function(error) {
            $('#error').text(error.status == 401 ? 'Usuário e/ou senha icorreto(s).' : 'Ocorreu um erro inesperado, tente novamente.');
        });
})

/*
username: enzo.zardo 
password: rMrnIdMT
*/