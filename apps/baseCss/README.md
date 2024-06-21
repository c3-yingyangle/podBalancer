# baseCss
## Add custom styling to your application, without creating a custom component.

### How to use this package

1) Add `baseCss` as a dependency to your package.
2) Create a metadata `.json` file called `[module_name].PageContainer.json` at location `[your_package]/ui/c3/meta`. The module name you supply should match the module name of the route for the page on which the custom css should be applied.

    | If your route looks like... | Your `.json` metadata file should be named ... |
    ------------------------------|-----------------------------------------
    | MyCoolApp, MyAppPage, /my-app/my-page, /my-app/my-page | MyCoolApp.PageContainer.json |

    > ⚠ **The metadata file must have this naming convention.**
3) In that file, add the configuration:
    ```javascript
    {
      "type": "UiSdlBaseCssPageContainer"
    }
    ```
4) You can optionally add a wrapper element around a component to target it using css.
    - In the component's metadata who you want to wrap (for example, `MyApp.MyGrid.json`), add the following configuration at the component level:
      ```javascript
      "wrapWithMetadataId": true
      ```
    - If your component name is: `MyApp.MyGrid.json`
      
      Your component will be wrapped with a div as below:
      ```html
      <!-- dots are replaced with hyphens, and the name is lowercased -->
      <div class="c3-metadata-id-myapp-mygrid">
        <!-- your component -->
      </div>
      ```
    - You can then target that component in your `.scss` file:
      ```css
      .c3-metadata-id-myapp-mygrid {
        /* add your custom styles here */
      }
      ```

5) Create a file called `[Something]_base.scss` at `[your package]/src/ui/styling`.
    > ⚠ **The .scss filename must begin with a capital letter.**

    > ⚠ **The .scss filename must end in `_base`.**
6) Add your custom styles to that file.
7) If using server version < 8, provision your tag. If using server version >= 8, the new metadata will be synced to the server.
