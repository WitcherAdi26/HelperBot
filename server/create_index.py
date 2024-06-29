import os
from langchain_community.vectorstores import Chroma
from langchain_community.document_loaders import PyPDFLoader
from langchain.text_splitter import RecursiveCharacterTextSplitter
from langchain_huggingface import HuggingFaceEmbeddings
from tqdm import tqdm
from pathlib import Path
from decouple import config
import pinecone
from pinecone import ServerlessSpec 


# Initialize Pinecone
# pinecone_api_key = config('PINECONE_API_KEY')
# pinecone_environment = config('PINECONE_ENVIRONMENT')
# pinecone.init(api_key=pinecone_api_key, environment=pinecone_environment)


# inference_api_key = config('INFERENCE_API_KEY')
# os.environ['HUGGINGFACEHUB_API_TOKEN'] = inference_api_key


embeddings_model_name = "mixedbread-ai/mxbai-embed-large-v1"
embeddings = HuggingFaceEmbeddings(model_name=embeddings_model_name)

def create_index(upload_directory,chooseVectorStore):
    data = []
    directory = upload_directory
    total_files = len([name for name in os.listdir(directory) if name.endswith('.pdf')])
    print(total_files)

    # Use tqdm to iterate over the files with progress bar
    for file in tqdm(os.listdir(directory), total=total_files, desc='Processing PDFs'):
        file_path = os.path.join(directory, file)

        if file_path.endswith('.pdf'):
            loader = PyPDFLoader(file_path)
            text_splitter = RecursiveCharacterTextSplitter(chunk_size=400, chunk_overlap=20)
            docs = loader.load_and_split(text_splitter=text_splitter)
            data.extend(docs)
            print(f'Done with ${file}')

    user_id=int(upload_directory[8:])

    def useChroma():
        index_directory = f"indexes/{user_id}"
        Path(index_directory).mkdir(parents=True, exist_ok=True)

        persist_directory = index_directory

        vectordb = Chroma.from_documents(documents=data, embedding=embeddings, persist_directory=persist_directory)

        vectordb.persist()
    
    def usePinecone():
        index_name='HelperBot'
        namespace = f"user/{user_id}"

        # Check if index exists, if not create it
        if index_name not in pc.list_indexes():
            pinecone.create_index(
                name=index_name, 
                dimension=embeddings.dimension,
                metric="cosine",
                spec=ServerlessSpec(
                    cloud='aws', 
                    region='us-east-1'
                )     
            )

        index = pinecone.Index(index_name)

        # Embed and upsert documents
        for i, doc in enumerate(data):
            embedding = embeddings.embed([doc['text']])
            index.upsert([(str(i), embedding[0])],namespace=namespace)

        print(f"Indexing complete for user {user_id}")

    
    if(chooseVectorStore==1):
        useChroma()
    else:
        usePinecone()