package com.demo.web.webthymeleaf.controller;

import java.io.BufferedReader;
import java.io.InputStream;
import java.io.InputStreamReader;
import java.util.Arrays;
import java.util.List;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestParam;

@Controller
public class WelcomeController {

    // inject via application.properties
    @Value("${welcome.message}")
    private String message;

    private List<String> tasks = Arrays.asList("a", "b", "c", "d", "e", "f", "g");

    @GetMapping("/")
    public String main(Model model) {
        model.addAttribute("message", message);
        model.addAttribute("tasks", tasks);

        return "welcome"; //view
    }

    // /hello?name=kotlin
    @GetMapping("/hello")
    public String mainWithParam(
            @RequestParam(name = "name", required = false, defaultValue = "") 
			String name, Model model) {

        model.addAttribute("message", name);

        return "welcome"; //view
    }

    @GetMapping("/mieruca-optimize")
    public ResponseEntity<String> optimize() {
        String optimizeScript = getScript("/mieruca-optimize-dev.js");
        return ResponseEntity.ok(optimizeScript);
    }

    @GetMapping("/mieruca-hm")
    public ResponseEntity<String> hm() {
        String hmScript = getScript("/mieruca-hm-dev.js");
        return ResponseEntity.ok(hmScript);
    }

    @GetMapping("/mieruca-hm-spa")
    public ResponseEntity<String> hmSPA() {
        String hmScript = getScript("/spa-script-test.js");
        return ResponseEntity.ok(hmScript);
    }

    @GetMapping("/ve")
    public ResponseEntity<String> ve() {
        String hmScript = getScript("/VE-Code-Test.js");
        return ResponseEntity.ok(hmScript);
    }

    private String getScript(String fileName) {
        try (InputStream inputStream = WelcomeController.class.getResourceAsStream(fileName)) {
            if (inputStream != null) {
                StringBuilder resultStringBuilder = new StringBuilder();
                try (BufferedReader bufferedReader = new BufferedReader(new InputStreamReader(inputStream))) {
                    String line;
                    while ((line = bufferedReader.readLine()) != null) {
                        resultStringBuilder.append(line).append("\n");
                    }
                }
                return resultStringBuilder.toString();
            }
        } catch (Exception ignored) {

        }
        return "";
    }

}