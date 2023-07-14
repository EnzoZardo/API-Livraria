const urlParams = new URLSearchParams(window.location.search);
const access = urlParams.get('access');
const refresh = urlParams.get('refresh');

$.get({
    url: 'https://livraria-app.herokuapp.com/api/livros/',
    contentType: 'application/json',
    data: '',
    headers: { 'Authorization': `Bearer ${access}` },
    success: function(data) {
        for (row of data) {
            console.log();
            $('.livros-tbody').append(
                `<tr>
                    <td>${row.titulo}</td>
                    <td>${row.ISBN}</td>
                    <td>${row.autores.map((el) => { return el.nome }).join(',')}</>
                    <td>${row.editora.nome}</td>
                    <td>${row.categoria.nome}</td>
                    <td>${row.quantidade}</td>
                    <td>${row.preco}</td>
                </tr>`
            );
        }
    },
    error: function(err) {
        console.log(err);
    }
});

$.get({
    url: 'https://livraria-app.herokuapp.com/api/autores/',
    contentType: 'application/json',
    data: '',
    headers: { 'Authorization': `Bearer ${access}` },
    success: function(data) {
        for (autor of data) {
            $('#autores').append(
                `<div class='row-form'><input class='autor-checkbox' type='checkbox' name='${autor.id}-${autor.nome}' id='${autor.id}-${autor.nome}'><label for='${autor.id}-${autor.nome}'>${autor.nome}</label></div>`
            );
        }
    },
    error: function(err) {
        console.log(err);
    }
});

$.get({
    url: 'https://livraria-app.herokuapp.com/api/editoras/',
    contentType: 'application/json',
    data: '',
    headers: { 'Authorization': `Bearer ${access}` },
    success: function(data) {
        for (editora of data) {
            $('#editora').append(`
                <option name='${editora.id}-${editora.nome}' value='${editora.nome}'>${editora.nome}</option>
            `)
        }
    },
    error: function(err) {
        console.log(err);
    }
});

$.get({
    url: 'https://livraria-app.herokuapp.com/api/categorias/',
    contentType: 'application/json',
    data: '',
    headers: { 'Authorization': `Bearer ${access}` },
    success: function(data) {
        for (categoria of data) {
            $('#categoria').append(`
                <option name='${categoria.id}-${categoria.descricao}' value='${categoria.descricao}'>${categoria.descricao}</option>
            `);
        }
    },
    error: function(err) {
        console.log(err);
    }
});

$('#form-adcionar').on('submit', function(event) {
    event.preventDefault();
    const $this = $(this); // Armazena uma referência ao escopo externo
    if ($('.autor-checkbox').filter(':checked').length < 1) {
        $('#error').text('Selecione pelo menos um autor.');
        return;
    }
    fetch($(this).action(), {
            body: JSON.stringify({
                'titulo': $('[name="titulo"]').val(),
                'ISBN': $('[name="isbn"]').val(),
                'quantidade': Number.parseInt($('[name="quantidade"]').val()),
                'preco': Number.parseFloat($('[name="preco"]').val()),
                'categoria': Number.parseInt($('[name="categoria"] option:selected').attr('name').split('-')[0]),
                'editora': Number.parseInt($('[name="editora"] option:selected').attr('name').split('-')[0]),
                'autores': $('.autor-checkbox').filter(function() {
                    return $(`.autor-checkbox`).is(':checked');
                }).map(function() {
                    return Number.parseInt((this.getAttribute('name')).split('-')[0]);
                }).get()
            }),
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${access}`
            }
        })
        .then($this[0].reset())
        .catch(er => {
            $('#error').text(er);
        })
});



$('aside .side-checkbox').on('change', function() {
    if ($(this).is(':checked')) {
        $('aside .side-checkbox').not(this).prop('checked', false);
        $('section').not($('#section-' + $(this).attr('id'))).css('display', 'none');
        $('#section-' + $(this).attr('id')).css('display', 'flex');
    } else {
        $(this).prop('checked', true);
    }
});