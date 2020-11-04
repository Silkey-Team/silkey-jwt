# Silkey SDK


## Development

### Init

    git clone [repo]
    git hf init
    npx eslint --init
    git hf feature start [featue-name]

## Releasing

    git hf release start 0.1.0

    # change version
    # update changelog

    git hf release finish '0.1.0'

## Deploying

    # made release
    git checkout master
    git pull

    npm publish

## NPM package

    # create and publish release then publish package
    npm logout
    npm login 
    npm publish

    
