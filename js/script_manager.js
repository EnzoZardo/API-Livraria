const urlParams = new URLSearchParams(window.location.search);
const access = urlParams.get('access');
const refresh = urlParams.get('refresh');

var livros = {};

$.get({
    url: 'https://livraria-app.herokuapp.com/api/livros/',
    contentType: 'application/json',
    data: '',
    headers: { 'Authorization': `Bearer ${access}` },
    success: function(data) {
        for (row of data) {
            livros[row.id] = {
                titulo: row.titulo,
                ISBN: row.ISBN,
                autores: row.autores,
                editora: row.editora,
                categoria: row.categoria,
                quantidade: row.quantidade,
                preco: row.preco
            }
            $('.livros-tbody').append(
                `<tr id="${row.id}">
                    <td><input type='checkbox'/></td>
                    <td class="livro-titulo">${row.titulo}</td>
                    <td class="livro-isbn">${row.ISBN}</td>
                    <td class="livro-autores">${row.autores.map((el) => { return el.nome }).join(',')}</>
                    <td class="livro-editora">${row.editora.nome}</td>
                    <td class="livro-categoria">${row.categoria.nome}</td>
                    <td class="livro-quantidade">${row.quantidade}</td>
                    <td class="livro-preco">${row.preco}</td>
                </tr>`
            );
        }
        $('#mytable tbody tr').on('click', function() {
            $(this).find('td input').prop('checked', !$(this).find('td input').is(":checked"));
            verify_remove();
            verify_edit();
        });
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
            console.log(autor)
            $('.autores').append(
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
            $('.editora').append(`
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
            $('.categoria').append(`
                <option name='${categoria.id}-${categoria.descricao}' value='${categoria.descricao}'>${categoria.descricao}</option>
            `);
        }
    },
    error: function(err) {
        console.log(err);
    }
});

$('#form-adicionar').on('submit', function(event) {
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

$(document).ready(function() {
    $("#check-all").on('change', function() {
        if ($("#check-all").is(':checked')) {
            $("table input[type=checkbox]").each(function() {
                $(this).prop("checked", true);
            });

        } else {
            $("table input[type=checkbox]").each(function() {
                $(this).prop("checked", false);
            });
        }
        verify_remove();
        verify_edit();
    });
});

const verify_remove = () => {
    document.querySelector("#remove").disabled = !($("table input[type=checkbox]:checked").length > 0);
}


$("#remove").on('click', function() {
    $("table tbody input[type=checkbox]:checked").each(function() {
        $this = $(this);
        id = $this.parent().parent().attr('id');
        fetch(`https://livraria-app.herokuapp.com/api/livros/${id}/`, {
                method: "DELETE",
                headers: {
                    'Content-Type': 'application/json',
                    "Authorization": `Bearer ${access}`
                },
            })
            .then($this.parent().parent().remove())
            .catch(er => {
                console.log(er);
            });
    });
});

$('#edit').on('click', function() {
    console.log(livros);
})

const verify_edit = () => {
    document.querySelector("#edit").disabled = !($("table input[type=checkbox]:checked").length == 1);
}