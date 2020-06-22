from django.shortcuts import render

def home(request):

    return render(request, 'youbetter/home.html')
