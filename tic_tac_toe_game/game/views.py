from django.shortcuts import render, redirect
from django.views.generic import TemplateView
from django.http import Http404


# Create your views here.
class HomePage(TemplateView):
    template_name = "index.html"

    def post(self, request):
        room_code = request.POST.get("room_code")
        char_choice = request.POST.get("char_choice")
        return redirect("/play/{}?choice={}".format(room_code, char_choice))


class Game(TemplateView):
    template_name = "game.html"

    def get(self, request, room_code):
        choice = request.GET.get("choice")
        if choice not in ["X", "O"]:
            raise Http404("Choice does not exists")
        context = {
            "char_choice": choice,
            "room_code": room_code
        }
        return render(request, "game.html", context)

