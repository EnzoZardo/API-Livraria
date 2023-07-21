var urlParams = new URLSearchParams(window.location.search);
var access = urlParams.get('access');
var refresh = urlParams.get('refresh');
var livros = {};


const getLivros = async() => {
    try {
        const data = await $.get({
            url: 'https://livraria-app.herokuapp.com/api/livros/',
            contentType: 'application/json',
            data: '',
            headers: { 'Authorization': `Bearer ${access}` },
        });
        $('.livros-tbody').html('');
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
    } catch (err) {
        if (err.status == 401) {
            await getRefresh();
            alert("Tente novamente");
        }
        console.log(err);
    }
};

const getAutores = async() => {
    try {
        const data = await $.get({
            url: 'https://livraria-app.herokuapp.com/api/autores/',
            contentType: 'application/json',
            data: '',
            headers: { 'Authorization': `Bearer ${access}` },
        });

        for (autor of data) {
            $('.autores').append(
                `<div class='row-form'><input class='autor-checkbox' type='checkbox' name='${autor.id}-${autor.nome}-edit' id='${autor.id}-${autor.nome}'><label for='${autor.id}-${autor.nome}'>${autor.nome}</label></div>`
            );
        }
    } catch (err) {
        if (err.status == 401) {
            await getRefresh();
            alert("Tente novamente");
        }
        console.log(err);
    }
};

const getEditoras = async() => {
    try {
        const data = await $.get({
            url: 'https://livraria-app.herokuapp.com/api/editoras/',
            contentType: 'application/json',
            data: '',
            headers: { 'Authorization': `Bearer ${access}` },
        });

        for (editora of data) {
            $('.editora').append(`
                <option name='${editora.id}-${editora.nome}-edit' value='${editora.id}'>${editora.nome}</option>
            `);
        }
    } catch (err) {
        if (err.status == 401) {
            await getRefresh();
            alert("Tente novamente");
        }
        console.log(err);
    }
};

const getCategorias = async() => {
    try {
        const data = await $.get({
            url: 'https://livraria-app.herokuapp.com/api/categorias/',
            contentType: 'application/json',
            data: '',
            headers: { 'Authorization': `Bearer ${access}` },
        });

        for (categoria of data) {
            $('.categoria').append(`
                <option name='${categoria.id}-${categoria.descricao}-edit' value='${categoria.id}'>${categoria.descricao}</option>
            `);
        }
    } catch (err) {
        if (err.status == 401) {
            await getRefresh();
            alert("Tente novamente");
        }
        console.log(err);
    }
};

const getRefresh = async() => {
    try {
        const response = await fetch('https://livraria-app.herokuapp.com/api/token/refresh/', {
            body: JSON.stringify({
                "refresh": refresh
            }),
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            }
        });

        if (response.ok) {
            const data = await response.json();
            access = data.access;
        } else {
            const errorData = await response.json();
            throw new Error(errorData.error);
        }
    } catch (error) {
        alert(error);
    }
}


$('#form-adicionar').on('submit', function(event) {
    event.preventDefault();
    const $this = $(this); // Armazena uma referência ao escopo externo
    if ($('.autor-checkbox').filter(':checked').length < 1) {
        $('#error').text('Selecione pelo menos um autor.');
        return;
    }
    fetch($(this).attr('action'), {
            body: JSON.stringify({
                'titulo': $(this).find('[name="titulo"]').val(),
                'ISBN': $(this).find('[name="isbn"]').val(),
                'quantidade': Number.parseInt($(this).find('[name="quantidade"]').val()),
                'preco': Number.parseFloat($(this).find('[name="preco"]').val()),
                'categoria': Number.parseInt($(this).find('[name="categoria"] option:selected').attr('name').split('-')[0]),
                'editora': Number.parseInt($(this).find('[name="editora"] option:selected').attr('name').split('-')[0]),
                'autores': $('#form-adicionar .autor-checkbox:checked').filter(function() {
                    return this.checked;
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
        .catch((er) => {
            if (er.status == 401) {
                getRefresh();
                alert("Tente novamente");
            }
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
    document.querySelector("#edit").disabled = true;
    document.querySelector("#remove").disabled = true;
    getLivros();
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
    meuLivro = livros[$("table tbody input[type=checkbox]:checked").parent().parent().attr('id')];
    console.log(meuLivro.autores)
    $form = $('#form-editar');
    $form.css('display', 'grid');
    $form.find('[name=edit-titulo]').val(meuLivro.titulo);
    $form.find('[name=edit-isbn]').val(meuLivro.ISBN);
    $form.find('[name=edit-preco]').val(meuLivro.preco);
    $form.find('[name=edit-quantidade]').val(meuLivro.quantidade);
    $form.find(`input[type=checkbox]`).each(function() {
        $(this).prop('checked', false);
    })
    meuLivro.autores.forEach(el => {
        $form.find(`[name='${el.id}-${el.nome}-edit']`).prop('checked', true);
    });
    $form.find('[name=edit-editora]').val(meuLivro.editora.id);
    $form.find('[name=edit-categoria]').val(meuLivro.categoria.id);
});

$('#form-editar').on('submit', function(event) {
    event.preventDefault();
    $this = $(this);
    id = $("table tbody input[type=checkbox]:checked").parent().parent().attr('id');
    meuLivro = livros[id];
    console.log($this.find('#form-editar .autor-checkbox').filter(function() {
        return this.checked;
    }).map(function() {
        return Number.parseInt((this.getAttribute('name')).split('-')[0]);
    }).get())
    fetch($(this).attr('action') + `${id}/`, {
            body: JSON.stringify({
                'titulo': $('[name="edit-titulo"]').val(),
                'ISBN': $('[name="edit-isbn"]').val(),
                'quantidade': Number.parseInt($('[name="edit-quantidade"]').val()),
                'preco': Number.parseFloat($('[name="edit-preco"]').val()),
                'categoria': Number.parseInt($('[name="edit-categoria"] option:selected').attr('name').split('-')[0]),
                'editora': Number.parseInt($('[name="edit-editora"] option:selected').attr('name').split('-')[0]),
                'autores': $('#form-editar .autor-checkbox').filter(function() {
                    return this.checked;
                }).map(function() {
                    return Number.parseInt((this.getAttribute('name')).split('-')[0]);
                }).get()
            }),
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${access}`
            }
        })
        .then(() => {
            $this.css('display', 'none');
            getLivros();
        })
        .catch(er => {

            console.log(er);
        })
})

$('#form-editar input[type=reset]').on('click', function(event) {
    event.preventDefault();
    $("#form-editar").css('display', 'none');
})

const verify_edit = () => {
    document.querySelector("#edit").disabled = !($("table input[type=checkbox]:checked").length == 1);
}

const verify_remove = () => {
    document.querySelector("#remove").disabled = !($("table input[type=checkbox]:checked").length > 0);
}

const main = async() => {
    await getLivros();
    await getAutores();
    await getEditoras();
    await getCategorias();
};

main();