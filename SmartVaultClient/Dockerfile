FROM mcr.microsoft.com/dotnet/sdk:9.0 AS build
WORKDIR /src

# Copy everything
COPY SmartVaultClient.csproj .
# Restore as distinct layers
RUN dotnet restore  SmartVaultClient.csproj
# RUN dotnet build SmartVaultClient.csproj -c Release -o out
# Build and publish a release
COPY . .
RUN dotnet build SmartVaultClient.csproj -c Release -o /app/build
RUN dotnet publish -c Release -o out

FROM build AS publish
RUN dotnet publish SmartVaultClient.csproj -c Release -o /app/publish 

FROM nginx:alpine AS final
WORKDIR /usr/share/nginx/html
COPY --from=publish /app/publish/wwwroot .
COPY default.conf /etc/nginx/nginx.conf
# ENTRYPOINT ["dotnet", "SmartVaultClient.dll"]