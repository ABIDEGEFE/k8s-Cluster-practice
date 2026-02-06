from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from .serializer import CandidateSerializer
# Create your views here.
@csrf_exempt
def storeCandidate(request):
    if (request.method == "POST"):
        serializer = CandidateSerializer(data=request.POST)
        if serializer.is_valid():
            serializer.save()
            return JsonResponse(serializer.data, status=201)
        else:
            return JsonResponse(serializer.errors, status=400)
        
    else:
        return JsonResponse({"error": "Invalid HTTP method"}, status=405)
    




