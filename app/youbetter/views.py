from django.shortcuts import render

def home(request):
    data = { }

    if request.user.is_authenticated:
        data['username'] = request.user.username
        data['remote_db'] = request.user.get_url_for_remote_db_access()

    return render(request, 'youbetter/home.html', data)
